from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import torch
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained('yanekyuk/camembert-keyword-extractor')
model = AutoModelForTokenClassification.from_pretrained('yanekyuk/camembert-keyword-extractor')
keyword_extractor = pipeline("ner", model=model, tokenizer=tokenizer)

youtube = build("youtube", "v3", developerKey=os.getenv("DEVELOPER_KEY"))

def get_comments(video_id, part="snippet", max_results=100):
    try:
        response = youtube.commentThreads().list(
            part=part,
            videoId=video_id,
            textFormat="plainText",
            maxResults=max_results
        ).execute()

        comments = [item["snippet"]["topLevelComment"]["snippet"]["textDisplay"] for item in response["items"]]
        return comments
    except HttpError as error:
        return None

def extract_keywords(comments):
    keywords = {}
    for comment in comments:
        extracted = keyword_extractor(comment,grouped_entities=True)
        for entity in extracted:
            word = entity['word']
            keywords[word] = keywords.get(word, 0) + 1
    return keywords

@app.route('/extract-keywords', methods=['POST'])
def extract():
    data = request.json
    video_id = data.get('videoId')

    if not video_id:
        return jsonify({"error": "No video ID provided"}), 400

    comments = get_comments(video_id)
    if not comments:
        return jsonify({"error": "No comments found or failed to fetch comments."}), 500

    keyword_frequencies = extract_keywords(comments)
    return jsonify({"keywords": keyword_frequencies})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5003)

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

def get_comments(video_id, part="snippet", max_results=500):
    try:
        comments = []
        next_page_token = None
        total_results = 0
        max_pages = 5  # Limit to 5 pages (500 comments) to avoid excessive API usage
        page_count = 0
        
        while page_count < max_pages and total_results < max_results:
            # Make API request with page token if available
            request = youtube.commentThreads().list(
                part=part,
                videoId=video_id,
                textFormat="plainText",
                maxResults=100,  # YouTube API max per page is 100
                pageToken=next_page_token
            )
            response = request.execute()
            
            # Extract comments from response
            for item in response["items"]:
                comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                comments.append(comment_text)
                total_results += 1
                if total_results >= max_results:
                    break
            
            # Check if there are more pages
            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break
                
            page_count += 1

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

from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

tokenizer = AutoTokenizer.from_pretrained('nlptown/bert-base-multilingual-uncased-sentiment')
model = AutoModelForSequenceClassification.from_pretrained('nlptown/bert-base-multilingual-uncased-sentiment')


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

def analyze_sentiment(comment):
    tokens = tokenizer.encode(comment, return_tensors='pt')
    result = model(tokens)
    sentiment_score = int(torch.argmax(result.logits)) + 1  # Scores: 1 (negative) to 5 (positive)
    return sentiment_score

def calculate_sentiment_percentages(video_id):
    comments = get_comments(video_id)

    if not comments:
        return {"error": "No comments found or failed to fetch comments."}

    positive_count = 0
    neutral_count = 0
    negative_count = 0
    total_comments = len(comments)

    for comment in comments:
        score = analyze_sentiment(comment)

        if score > 3:
            positive_count += 1
        elif score == 3:
            neutral_count += 1
        else:
            negative_count += 1

    positive_percentage = (positive_count / total_comments) * 100
    neutral_percentage = (neutral_count / total_comments) * 100
    negative_percentage = (negative_count / total_comments) * 100

    return {
        "positive_percentage": positive_percentage,
        "neutral_percentage": neutral_percentage,
        "negative_percentage": negative_percentage
    }

@app.route('/analyze-sentiment', methods=['POST'])
def analyze():
    data = request.json
    video_id = data.get('videoId')

    if not video_id:
        return jsonify({"error": "No video ID provided"}), 400

    result = calculate_sentiment_percentages(video_id)

    if "error" in result:
        return jsonify({"error": result["error"]}), 500

    return jsonify(result)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5002)

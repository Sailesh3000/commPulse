from flask import Flask, request, jsonify
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# Load toxicity detection model
tokenizer = RobertaTokenizer.from_pretrained('s-nlp/roberta_toxicity_classifier')
model = RobertaForSequenceClassification.from_pretrained('s-nlp/roberta_toxicity_classifier')

# Set up YouTube API client
youtube = build("youtube", "v3", developerKey=os.getenv("DEVELOPER_KEY"))

def get_comments(video_id, part="snippet", max_results=100):
    try:
        response = youtube.commentThreads().list(
            part=part,
            videoId=video_id,
            textFormat="plainText",
            maxResults=max_results
        ).execute()

        comments = []
        for item in response["items"]:
            comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment_text)

        return comments

    except HttpError as error:
        return None

def analyze_toxicity(comment):
    tokens = tokenizer.encode(comment, return_tensors='pt')
    result = model(tokens)
    # Get the probability of toxic class (index 1)
    probabilities = torch.nn.functional.softmax(result.logits, dim=-1)
    toxic_probability = probabilities[0][1].item()
    return toxic_probability

def calculate_toxicity_metrics(video_id):
    comments = get_comments(video_id)

    if not comments:
        return {"error": "No comments found or failed to fetch comments."}

    total_comments = len(comments)
    toxic_count = 0
    high_toxicity_count = 0
    moderate_toxicity_count = 0
    low_toxicity_count = 0
    safe_count = 0
    
    toxicity_scores = []

    for comment in comments:
        toxic_score = analyze_toxicity(comment)
        toxicity_scores.append(toxic_score)
        
        if toxic_score >= 0.9:
            high_toxicity_count += 1
            toxic_count += 1
        elif toxic_score >= 0.7:
            moderate_toxicity_count += 1
            toxic_count += 1
        elif toxic_score >= 0.5:
            low_toxicity_count += 1
            toxic_count += 1
        else:
            safe_count += 1

    # Calculate percentages
    toxic_percentage = (toxic_count / total_comments) * 100
    safe_percentage = (safe_count / total_comments) * 100
    high_toxicity_percentage = (high_toxicity_count / total_comments) * 100
    moderate_toxicity_percentage = (moderate_toxicity_count / total_comments) * 100
    low_toxicity_percentage = (low_toxicity_count / total_comments) * 100
    
    # Calculate average toxicity
    average_toxicity = sum(toxicity_scores) / total_comments if toxicity_scores else 0

    return {
        "total_comments": total_comments,
        "toxic_percentage": toxic_percentage,
        "safe_percentage": safe_percentage,
        "high_toxicity_percentage": high_toxicity_percentage,
        "moderate_toxicity_percentage": moderate_toxicity_percentage,
        "low_toxicity_percentage": low_toxicity_percentage,
        "average_toxicity": average_toxicity
    }

@app.route('/analyze-toxicity', methods=['POST'])
def analyze():
    data = request.json
    video_id = data.get('videoId')

    if not video_id:
        return jsonify({"error": "No video ID provided"}), 400

    result = calculate_toxicity_metrics(video_id)

    if "error" in result:
        return jsonify({"error": result["error"]}), 500

    return jsonify(result)

# For testing individual comments
@app.route('/check-toxicity', methods=['POST'])
def check_toxicity():
    data = request.json
    comment = data.get('comment')

    if not comment:
        return jsonify({"error": "No comment provided"}), 400

    toxic_score = analyze_toxicity(comment)
    
    return jsonify({
        "comment": comment,
        "toxicity_score": toxic_score,
        "is_toxic": toxic_score >= 0.5
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5004)
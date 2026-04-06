"""
Hugging Face Space for Todo AI Chatbot API
This creates a combined Gradio/FastAPI application
"""
import gradio as gr
from fastapi import FastAPI
from main import app as fastapi_app  # Import the existing FastAPI app
from main import lifespan as original_lifespan  # Import the original lifespan
import uvicorn
from contextlib import asynccontextmanager
import threading
import time
import requests
import os
import uuid
from typing import Union
from pydantic import BaseModel

# Create a combined FastAPI app that includes both the original API and Gradio
@asynccontextmanager
async def lifespan_combined(app: FastAPI):
    # Startup
    print("Starting combined Todo AI Chatbot API and Gradio interface...")

    # Use the original lifespan for database/telemetry initialization
    try:
        async with original_lifespan(app):
            print("Original FastAPI lifespan started successfully")
            yield
    except Exception as e:
        print(f"Warning: Original lifespan error (continuing anyway): {e}")
        # Even if lifespan has issues, yield to keep app running
        yield

    # Shutdown
    print("Shutting down combined Todo AI Chatbot API and Gradio interface...")

# Create the main FastAPI app with lifespan
combined_app = FastAPI(lifespan=lifespan_combined)

# Copy routes from the original FastAPI app
for route in fastapi_app.routes:
    # Skip the root route to avoid conflicts
    if route.path != "/":
        combined_app.routes.append(route)

# Add a root route that redirects to the Gradio interface
@combined_app.get("/")
async def root():
    return {"message": "Todo AI Chatbot API. Visit /gradio for the Gradio interface."}

# Create the Gradio interface
def test_health():
    try:
        # When running locally for testing, we'll make requests to our own server
        # In Hugging Face Space, this will work because both are on the same server
        port = int(os.getenv("PORT", 7860))
        response = requests.get(f"http://localhost:{port}/api/health")
        if response.status_code == 200:
            data = response.json()
            return f"✅ Health Check Passed\nStatus: {data.get('status', 'unknown')}\nVersion: {data.get('version', 'unknown')}"
        else:
            return f"❌ Health Check Failed\nStatus Code: {response.status_code}\nResponse: {response.text}"
    except Exception as e:
        return f"❌ Connection Error\n{str(e)}"

def signup_user(email, password):
    try:
        port = int(os.getenv("PORT", 7860))
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"http://localhost:{port}/api/auth/signup", json=payload)
        if response.status_code == 201:
            data = response.json()
            return f"✅ Signup Successful\nUser ID: {data['user']['id']}\nMessage: {data['message']}"
        else:
            return f"❌ Signup Failed\nStatus: {response.status_code}\nError: {response.text}"
    except Exception as e:
        return f"❌ Connection Error\n{str(e)}"

def signin_user(email, password):
    try:
        port = int(os.getenv("PORT", 7860))
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"http://localhost:{port}/api/auth/signin", json=payload)
        if response.status_code == 200:
            data = response.json()
            return f"✅ Signin Successful\nUser ID: {data['user']['id']}\nMessage: {data['message']}"
        else:
            return f"❌ Signin Failed\nStatus: {response.status_code}\nError: {response.text}"
    except Exception as e:
        return f"❌ Connection Error\n{str(e)}"

def chat_with_bot(message, conversation_id=None):
    try:
        port = int(os.getenv("PORT", 7860))
        payload = {
            "message": message
        }
        if conversation_id:
            payload["conversation_id"] = conversation_id

        response = requests.post(f"http://localhost:{port}/api/chat", json=payload)
        if response.status_code == 200:
            data = response.json()
            return data['response'], data.get('conversation_id', conversation_id or str(uuid.uuid4()))
        else:
            return f"❌ Chat Failed\nStatus: {response.status_code}\nError: {response.text}", conversation_id
    except Exception as e:
        return f"❌ Connection Error\n{str(e)}", conversation_id

def create_task(title, priority, due_date):
    try:
        port = int(os.getenv("PORT", 7860))
        payload = {
            "title": title,
            "priority": priority,
            "due_date": due_date if due_date else None
        }
        response = requests.post(f"http://localhost:{port}/api/tasks", json=payload)
        if response.status_code == 201:
            data = response.json()
            return f"✅ Task Created\nID: {data['id']}\nTitle: {data['title']}\nPriority: {data['priority']}"
        else:
            return f"❌ Task Creation Failed\nStatus: {response.status_code}\nError: {response.text}"
    except Exception as e:
        return f"❌ Connection Error\n{str(e)}"

# Create the Gradio interface
with gr.Blocks(title="Todo AI Chatbot - Hugging Face Space") as gradio_interface:
    gr.Markdown("# 🤖 Todo AI Chatbot - API Test Interface")
    gr.Markdown("Test the Todo AI Chatbot API endpoints")

    with gr.Tab("Health Check"):
        health_btn = gr.Button("Check Health")
        health_output = gr.Textbox(label="Health Status", interactive=False)
        health_btn.click(fn=test_health, outputs=health_output)

    with gr.Tab("Authentication"):
        with gr.Row():
            with gr.Column():
                email_input = gr.Textbox(label="Email")
                password_input = gr.Textbox(label="Password", type="password")
                signup_btn = gr.Button("Sign Up")
                signin_btn = gr.Button("Sign In")
            with gr.Column():
                auth_output = gr.Textbox(label="Authentication Result", interactive=False)

        signup_btn.click(fn=signup_user, inputs=[email_input, password_input], outputs=auth_output)
        signin_btn.click(fn=signin_user, inputs=[email_input, password_input], outputs=auth_output)

    with gr.Tab("Chat"):
        with gr.Row():
            with gr.Column():
                chat_input = gr.Textbox(label="Your Message", placeholder="Add buy groceries to my list...")
                chat_btn = gr.Button("Send Message")
            with gr.Column():
                conv_id_input = gr.Textbox(label="Conversation ID (optional)", placeholder="Leave blank for new conversation")
                chat_output = gr.Textbox(label="Bot Response", interactive=False)

        chat_btn.click(
            fn=chat_with_bot,
            inputs=[chat_input, conv_id_input],
            outputs=[chat_output, conv_id_input]
        )

    with gr.Tab("Tasks"):
        with gr.Row():
            with gr.Column():
                title_input = gr.Textbox(label="Task Title")
                priority_input = gr.Dropdown(choices=["low", "medium", "high", "urgent"], value="medium", label="Priority")
                due_date_input = gr.Textbox(label="Due Date (YYYY-MM-DD)", placeholder="2024-12-31")
                create_task_btn = gr.Button("Create Task")
            with gr.Column():
                task_output = gr.Textbox(label="Task Result", interactive=False)

        create_task_btn.click(
            fn=create_task,
            inputs=[title_input, priority_input, due_date_input],
            outputs=task_output
        )

    gr.Markdown("## API Documentation")
    gr.Markdown("""
    - Health: `GET /api/health`
    - Signup: `POST /api/auth/signup`
    - Signin: `POST /api/auth/signin`
    - Chat: `POST /api/chat`
    - Tasks: `GET/POST/PUT/DELETE /api/tasks`
    """)

# Mount the Gradio interface to the FastAPI app
combined_app = gr.mount_gradio_app(combined_app, gradio_interface, path="/gradio")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(combined_app, host="0.0.0.0", port=port, log_level="info")
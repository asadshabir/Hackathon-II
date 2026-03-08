#!/usr/bin/env python3
"""
Test script to verify deployed backend functionality.
"""

import requests
import time

BACKEND_URL = "https://asadshabir110-todo-ai-chatbot-api.hf.space"

def test_health():
    """Test health endpoint."""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_api_docs():
    """Test if API docs are accessible."""
    try:
        response = requests.get(f"{BACKEND_URL}/docs")
        if response.status_code == 200:
            print("✅ API Documentation accessible")
            return True
        else:
            print(f"❌ API Docs error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Docs error: {e}")
        return False

def main():
    print("Testing deployed backend at:", BACKEND_URL)
    print("-" * 50)

    success = True

    print("Testing health endpoint...")
    success &= test_health()

    print("\nTesting API documentation...")
    success &= test_api_docs()

    print("\n" + "-" * 50)
    if success:
        print("🎉 All tests passed! Backend is deployed and accessible.")
        print("\nNext steps:")
        print("1. Add environment variables to your Vercel project")
        print("2. Deploy frontend to Vercel")
        print("3. Set custom domain: full-stack-todoapp-asadshabir.vercel.app")
    else:
        print("❌ Some tests failed. Please check the deployment.")

if __name__ == "__main__":
    main()

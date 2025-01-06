# SumWik 📝

SumWik(https://sumwik-fe.vercel.app/), is an elegant, user-friendly web application that transforms lengthy Wikipedia articles into clear, concise summaries. Using advanced AI technology, it distills complex information into digestible content while maintaining accuracy and context.

## ✨ Features

- **Instant Summarization**: Convert any Wikipedia article into a clear, concise summary
- **Random Article**: Discover new knowledge with the random article feature
- **Accessibility First**: Listen to summaries with built-in text-to-speech
- **Multi-format Export**: Save summaries in various formats for later use
- **Original Content**: Easy access to source article for reference
- **Share & Collaborate**: Quick sharing options for collaboration
- **Mobile Responsive**: Perfect experience across all devices

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: NodeJS,Express
- **AI/ML**: Groq API (Mixtral-8x7b-32768)
- **Styling**: Custom CSS with modern design principles
- **Deployment**: Vercel

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/abhinavagrahri1/sumwik.git
cd sumwik
```

2. Install dependencies:
```bash
npm i
```

3. Set up environment variables:
```bash
# Create a .env file and add your Groq API key
echo "GROQ_API_KEY=your_api_key_here" > .env
```

4. Run the application:
```bash
node index.js
```

Visit `http://localhost:9000` in your browser to use the application.

## 🌟 Usage

1. **Direct URL**: Paste any Wikipedia URL and click "Summarize"
2. **Random Article**: Click "Random Article" to discover new topics
3. **Interact with Summary**:
   - Listen to the summary
   - Copy to clipboard
   - Share with others
   - Export as HTML
   - View original article

## 🎯 Key Features Explained

### Intelligent Summarization
SumWik uses advanced AI to create summaries that:
- Capture main points and key details
- Maintain clear and engaging writing style
- Include important facts and figures
- Structure content for optimal readability

### Accessibility Features
- Text-to-speech functionality
- Keyboard navigation support
- ARIA labels for screen readers

### Export Options
- Copy to clipboard
- Share via native sharing
- Export as formatted HTML
- Access to original content

## 🌐 API Routes

- `GET /`: Home page
- `GET /random`: Get random Wikipedia article summary
- `POST /generate`: Generate summary from provided URL

## 🛡️ Error Handling

SumWik includes robust error handling for:
- Invalid URLs
- Network failures
- API limitations
- Content extraction issues

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for their powerful AI API
- [Wikipedia](https://www.wikipedia.org/) for their extensive knowledge base
- All contributors and supporters of the project

---

<p align="center">Built with ❤️ by <a href="https://github.com/abhinavagrahari1">Abhinav Agrahari</a></p>

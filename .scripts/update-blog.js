const fs = require('fs');
const path = require('path');
const marked = require('marked');

let issue;
if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
  issue = {
    title: process.env.INPUT_TITLE || '测试文章',
    body: process.env.INPUT_CONTENT || '这是一篇测试文章的内容。',
    created_at: new Date().toISOString()
  };
} else {
  issue = JSON.parse(process.env.ISSUE || '{"title":"测试文章","body":"这是一篇测试文章的内容。","created_at":"' + new Date().toISOString() + '"}');
}

const title = issue.title;
const body = issue.body;
const date = new Date(issue.created_at).toLocaleDateString('zh-CN');
const fileName = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// 将 Markdown 转换为 HTML
const htmlContent = marked.parse(body);

// 创建新的博客文章
const postContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 我的博客</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
            background-color: #f8f9fa;
        }
        article {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        header h1 {
            margin: 0;
            color: #2c3e50;
        }
        .post-date {
            color: #666;
            font-size: 0.9em;
            margin-top: 10px;
        }
        .post-content {
            margin-top: 30px;
            line-height: 1.8;
        }
        .post-content h2 {
            color: #2c3e50;
            margin-top: 40px;
        }
        .post-content h3 {
            color: #34495e;
            margin-top: 30px;
        }
        .post-content p {
            margin: 20px 0;
        }
        .post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 20px 0;
        }
        .post-content pre {
            background: #f6f8fa;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.45;
        }
        .post-content code {
            background: #f6f8fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 0.9em;
            color: #e83e8c;
        }
        .post-content pre code {
            color: #333;
            padding: 0;
            background: none;
        }
        .post-content blockquote {
            margin: 20px 0;
            padding: 0 20px;
            border-left: 4px solid #42b983;
            color: #666;
        }
        .back-link {
            display: inline-block;
            margin-top: 40px;
            color: #0366d6;
            text-decoration: none;
            font-weight: 500;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <article>
        <header>
            <h1>${title}</h1>
            <div class="post-date">${date}</div>
        </header>

        <div class="post-content">
            ${htmlContent}
        </div>

        <a href="../index.html" class="back-link">← 返回首页</a>
    </article>
</body>
</html>`;

// 保存文章
if (!fs.existsSync('posts')) {
  fs.mkdirSync('posts');
}
fs.writeFileSync(path.join('posts', `${fileName}.html`), postContent);

// 更新首页
let indexContent = fs.readFileSync('index.html', 'utf8');
const excerpt = body.split('\n')[0].substring(0, 200) + (body.length > 200 ? '...' : '');

// 检查是否存在 no-posts 提示
if (indexContent.includes('class="no-posts"')) {
  // 如果是第一篇文章，删除 no-posts 提示
  indexContent = indexContent.replace(/<div class="no-posts">.*?<\/div>/s, '');
}

const newPost = `
    <article class="post">
        <h2><a href="posts/${fileName}.html" class="post-title">${title}</a></h2>
        <div class="post-date">${date}</div>
        <p class="post-excerpt">${excerpt}</p>
    </article>`;

indexContent = indexContent.replace('<div class="create-post">', `${newPost}\n    <div class="create-post">`);
fs.writeFileSync('index.html', indexContent);

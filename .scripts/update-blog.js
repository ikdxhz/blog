const fs = require('fs');
const path = require('path');
const marked = require('marked');

// 获取所有文章
function getAllPosts() {
  const postsDir = 'posts';
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir);
    return [];
  }
  
  // 清理所有现有文章
  const files = fs.readdirSync(postsDir);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      fs.unlinkSync(path.join(postsDir, file));
    }
  });
  
  return [];
}

// 创建新文章
function createNewPost() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = now.toLocaleTimeString('zh-CN');
  
  const title = dateStr + ' 记录';
  const body = '今天是 ' + dateStr + '，现在是 ' + timeStr + '。';
  
  const fileName = `post-${dateStr}.html`;
  const htmlContent = marked.parse(body);
  
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
          .post-content input[type="checkbox"] {
              margin-right: 8px;
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
              <div class="post-date">${dateStr}</div>
          </header>
  
          <div class="post-content">
              ${htmlContent}
          </div>
  
          <a href="../index.html" class="back-link">← 返回首页</a>
      </article>
  </body>
  </html>`;
  
  if (!fs.existsSync('posts')) {
    fs.mkdirSync('posts');
  }
  fs.writeFileSync(path.join('posts', fileName), postContent);
  return fileName;
}

// 更新首页
function updateIndex(posts) {
  let indexContent = fs.readFileSync('index.html', 'utf8');
  
  // 清除所有现有文章
  indexContent = indexContent.replace(/<article[\s\S]*?<\/article>/g, '');
  
  // 添加文章列表
  const postsHtml = posts.map(post => `
      <article class="post${post.isPinned ? ' pinned' : ''}">
          <h2><a href="posts/${post.file}" class="post-title">${post.title}</a></h2>
          <div class="post-date">${post.date}</div>
          <p class="post-excerpt">${post.excerpt}</p>
      </article>`).join('\n');
  
  // 如果没有文章，显示提示信息
  if (posts.length === 0) {
    indexContent = indexContent.replace(/<main>[\s\S]*?<\/main>/, `
    <main>
        <div class="no-posts">
            还没有博客文章，点击下方按钮创建第一篇文章！
        </div>
        
        <div class="create-post">
            <a href="https://github.com/ikdxhz/blog/actions/workflows/update-blog.yml" target="_blank">
                ✍️ 写新文章
            </a>
        </div>
    </main>`);
  } else {
    indexContent = indexContent.replace(/<main>[\s\S]*?<\/main>/, `
    <main>
        ${postsHtml}
        
        <div class="create-post">
            <a href="https://github.com/ikdxhz/blog/actions/workflows/update-blog.yml" target="_blank">
                ✍️ 写新文章
            </a>
        </div>
    </main>`);
  }
  
  fs.writeFileSync('index.html', indexContent);
}

// 主逻辑
if (process.env.GITHUB_EVENT_NAME === 'workflow_dispatch') {
  // 创建新文章
  const newFileName = createNewPost();
  console.log(`新文章已创建: ${newFileName}`);
}

// 重新整理所有文章
const posts = getAllPosts();
updateIndex(posts);
console.log(`已更新 ${posts.length} 篇文章`);

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'src', 'posts');
const blogDir = path.join(__dirname, 'src', 'pages/blog');

// Ensure blog directory exists
if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir);
}

// List all markdown files
fs.readdir(postsDir, (err, files) => {
  files.forEach(file => {
    if (path.extname(file) === '.md') {
      const postName = path.basename(file, '.md');
      const variableName = postName.replace(/-/g, '_');  // Replace hyphens with underscores
      
      const content = `
extends ../../layouts/post_layout.pug

block post-var
  include ../../posts/metadata.pug
  - var data = ${variableName}

block post
  include:markdown-it ../../posts/${postName}.md
      `;

      fs.writeFileSync(path.join(blogDir, `${postName}.pug`), content.trim());
    }
  });
});
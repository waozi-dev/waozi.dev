const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');  // Make sure to install the js-yaml package

const postsDir = path.join(__dirname, 'src', 'posts');
const blogDir = path.join(__dirname, 'src', 'pages/blog');
const dataDir = path.join(__dirname, 'src', '_gen');  // Define the path for the data directory

// Ensure blog and data directories exist
if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir);
}
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

let metadataContent = '';  // This will store the combined metadata for all posts

// List all YAML files
fs.readdir(postsDir, (err, files) => {
  files.forEach(file => {
    if (path.extname(file) === '.yaml') {
      const postName = path.basename(file, '.yaml');
      const variableName = postName.replace(/-/g, '_');  // Replace hyphens with underscores
      
      // Parse the YAML file
      const postData = yaml.load(fs.readFileSync(path.join(postsDir, file), 'utf8'));
      
      // Convert the parsed YAML data to Pug variable declaration format
      metadataContent += `
-
  var ${variableName} = ${JSON.stringify(postData)}
      `;
      
      const content = `
extends ../../layouts/post_layout.pug

block variables
  include ../../_gen/metadata.pug
  - var data = ${variableName}
  - title = data.title
  - description = data.desc
  - social_logo = data.imgSrc
  - url = data.url

block post
  include:markdown-it ../../posts/${postName}.md
      `;

      fs.writeFileSync(path.join(blogDir, `${postName}.pug`), content.trim());
    }
  });

  // Write the combined metadata to the metadata.pug file in the data directory
  fs.writeFileSync(path.join(dataDir, 'metadata.pug'), metadataContent.trim());
});

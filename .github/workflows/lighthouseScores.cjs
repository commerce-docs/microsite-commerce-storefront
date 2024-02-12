const fs = require('fs');
const path = require('path');

module.exports = ({ github, context }) => {
  const lighthouseReportPath = './.lighthouseci';
  const lighthouseScoresComment = generateLighthouseScoresComment(lighthouseReportPath);

  return github.rest.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body: lighthouseScoresComment,
  });
}

function readJSONFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function scoreToEmoji(score) {
  return score === 100 ? '🎉' : score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
}

function urlToPagePath(url) {
  return new URL(url).pathname.substring(1);
}

function generateScoresForCategories(report) {
  if (!report.categories || typeof report.categories !== 'object') {
    return 'No categories found in report.\n';
  }

  return Object.entries(report.categories).map(([_, category]) => {
    const score = Math.round(category.score * 100);
    const emoji = scoreToEmoji(score);
    return `${emoji} **${category.title[0]}:** ${score}% `;
  }).join('');
}

function generateLighthouseScoresComment(reportPath) {
  let commentBody = '#### 🚀 Lighthouse Results\n';

  const reportFiles = fs.readdirSync(reportPath);
  reportFiles.forEach(file => {
    if (file.includes('links') || path.extname(file) !== '.json') return;

    const reportFilePath = path.join(reportPath, file);
    const report = readJSONFile(reportFilePath);
    const categoryScores = generateScoresForCategories(report);
    commentBody += categoryScores;

    if (report.requestedUrl) {
      const pagePath = urlToPagePath(report.requestedUrl);
      commentBody += `— ${pagePath} `;
    }

    commentBody += '\n';
  });

  return commentBody;
}

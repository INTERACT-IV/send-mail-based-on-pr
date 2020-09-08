const nodemailer = require('nodemailer');
const github = require('@actions/github');
const core = require('@actions/core');
const octokit = new github.getOctokit(core.getInput('github_token'));

async function main() {
  const ref = github.context.ref;

  core.info(`Searching for open pull requests with source=${ref}`);

  const { data: pullRequests } = await octokit.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    state: "open",
    head: `${github.context.repo.owner}:${ref}`
  });

  core.info(`Found ${pullRequests.length} open pull requests with source=${ref}`);

  if (pullRequests.length !== 1) {
      return;
  }

  const emailBodyContent = [];

  if (core.getInput('text_before')) {
    emailBodyContent.push(core.getInput('text_before'));
  }

  emailBodyContent.push(pullRequests[0].body);

  if (core.getInput('text_after')) {
    emailBodyContent.push(core.getInput('text_after'));
  }

  emailBody = emailBodyContent.join('\n\n');

  const transporter = nodemailer.createTransport({
    service: core.getInput('mail_service'),
    auth: {
      user: core.getInput('mail_user'),
      pass: core.getInput('mail_password')
    }
  });

  var mailOptions = {
    from: core.getInput('mail_user'),
    to: core.getInput('mail_recipients'),
    subject: core.getInput('subject'),
    text: emailBody
  };

  if (core.getInput('reply_to')) {
    mailOptions.replyTo = core.getInput('reply_to');
  }

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      core.info('Email not sent ' + error.message);
      core.setFailed();
    } else {
      core.info('Email sent ' + info.response);
    }
  });
}

main();

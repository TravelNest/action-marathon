import * as fs from "fs";
import { Octokit } from "@octokit/action";

interface IGitHubPullRequest {
  number: Number;
}

interface IGitHubEvent {
  pull_request: IGitHubPullRequest | null;
}

export const getPullRequestNumber = (): Number | null => {
  const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")
  ) as IGitHubEvent;

  return event.pull_request?.number;
};

export const getCommentNumber = async (
  substr: String
): Promise<Number | null> => {
  const octokit = new Octokit();
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const issueNumber = getPullRequestNumber();

  const { data } = await octokit.request(
    "GET /repos/:owner/:repo/issues/:issueNumber/comments",
    {
      owner,
      repo,
      issueNumber,
    }
  );

  for (const comment of data) {
    if ((comment as any).body.includes(substr)) {
      return (comment as any).id;
    }
  }

  return null;
};

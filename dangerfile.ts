import { danger, warn, message } from "danger";

// 1. Description Check
if (danger.github.pr.body.length < 10) {
  warn("Please include a description of your PR changes.");
}

// 2. Lockfile Check
const packageChanged = danger.git.modified_files.includes("package.json");
const lockfileChanged = danger.git.modified_files.includes("package-lock.json");
if (packageChanged && !lockfileChanged) {
  warn("Changes were made to `package.json`, but not to `package-lock.json`. Did you forget to run `npm install`?");
}

// 3. Big PR Warning
const bigPRThreshold = 500;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(`This PR is a bit big (${danger.github.pr.additions + danger.github.pr.deletions} lines). Consider splitting it into smaller PRs.`);
}

// 4. Console Log Check
const jsFiles = danger.git.created_files.concat(danger.git.modified_files).filter(f => f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".tsx"));
jsFiles.forEach(file => {
  danger.git.diffForFile(file).then(diff => {
    if (diff && diff.added.includes("console.log")) {
      warn(`A \`console.log\` was found in \`${file}\`. Please remove it before merging.`);
    }
  });
});

// 5. WIP Check
if (danger.github.pr.title.toLowerCase().includes("wip")) {
  warn("This PR is marked as Work In Progress (WIP).");
}

// 6. Test Check
const hasSourceChanges = danger.git.modified_files.some(f => f.startsWith("src/"));
const hasTestChanges = danger.git.modified_files.some(f => f.includes(".test.") || f.includes(".spec."));
if (hasSourceChanges && !hasTestChanges) {
  warn("There are source code changes but no new tests. Please consider adding tests.");
}

message("Danger has finished reviewing this PR. Thanks for your contribution!");

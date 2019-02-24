import * as vscode from 'vscode';

const SECOND_MILLISECONDS = 1000;
const SEARCH_SECONDS = 30;

export async function SearchingForLightsCallback(progress: vscode.Progress<{ increment: number, message: string }>) {
  progress.report({ increment: 0, message: `${SEARCH_SECONDS}s` });

  for (let second = SEARCH_SECONDS; second > 0; second--) {
    await new Promise((resolve) => setTimeout(() => resolve(), SECOND_MILLISECONDS));
    progress.report({
      increment: (100 / SEARCH_SECONDS),
      message: `${second}s`
    });
  }

  return new Promise((resolve) => resolve());
}
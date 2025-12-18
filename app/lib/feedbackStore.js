// app/lib/feedbackStore.js

let feedbacks = [];

export function addFeedback(data) {
  feedbacks.push({
    ...data,
    time: new Date().toISOString(),
  });
}

export function getAllFeedback() {
  return feedbacks;
}

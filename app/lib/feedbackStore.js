// SIMPAN FEEDBACK DI MEMORY (sementara, untuk prototype)

let feedbacks = [];

export function addFeedback(data) {
  feedbacks.push(data);
}

export function getAllFeedback() {
  return feedbacks;
}

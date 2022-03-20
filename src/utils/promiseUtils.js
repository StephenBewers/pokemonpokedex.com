/* This file contains utility functions for promises */

// Wraps around a Promise to make it cancellable as per https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
export function makeCancellable(promise) {
  let hasCancelled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => (hasCancelled_ ? reject({ isCancelled: true }) : resolve(val)),
      (error) => (hasCancelled_ ? reject({ isCancelled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCancelled_ = true;
    },
  };
}


// Cancels a promise
export function cancelPromise(promise, errorHandler) {
  promise.promise.then().catch((error) => errorHandler(error));
  promise.cancel();
}


// Handles any errors that get thrown
export function errorHandler(error) {
    // If the error has been thrown because of a cancelled promise, we don't need to do anything
    if (error.isCancelled) {
      return;
    } else {
      console.error(error);
    }
  }

class Subscription {
    constructor() {
        this.teardowns = [];
    }

    add(tearDown) {
        this.teardowns.push(tearDown);
    }

    unsubscribe() {
        this.teardowns.forEach((teardown) => teardown());
        this.teardowns = [];
    }
}

class Subscriber {
    constructor(observer, subscription) {
        this.observer = observer;
        this.subscription = subscription;
        this.unsubscribed = false;
        this.subscription.add(() => {
            return (this.unsubscribed = true);
        });
    }

    next(value) {
        if (!this.unsubscribed) {
            this.observer.next(value);
        }
    }

    error(err) {
        if (!this.unsubscribed) {
            this.unsubscribed = true;
            this.observer.error(err);
            this.subscription.unsubscribe();
        }
    }

    complete() {
        if (!this.unsubscribed) {
            this.unsubscribed = true;
            this.observer.complete();
            this.subscription.unsubscribe();
        }
    }
}

class Observable {
    constructor(initFunc) {
        this.initFunc = initFunc;
    }

    subscribe(observer) {
        const subscription = new Subscription();
        const subscriber = new Subscriber(observer, subscription);
        const teardown = this.initFunc(subscriber);
        subscription.add(teardown);
        return teardown;
    }
}

const myObservable = new Observable((observer) => {
    let counter = 0;
    const intervalId = setInterval(() => {
        ++counter;
        console.log("Memory Leak " + counter);
        observer.next(++counter);
    }, 2000);
    setTimeout(() => observer.complete(), 5000);

    return () => {
        console.log("Memory leak handled!");
        clearInterval(intervalId);
    };
});

const subscription = myObservable.subscribe({
    next: (x) => {
        console.log(x);
    },
    error: (error) => {
        console.log(error);
    },
    complete: () => {
        console.log("Completed!");
    },
});

subscription();

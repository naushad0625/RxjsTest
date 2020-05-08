const map = (mapFunc) => {
	return (srcObservable) => {
		return new Observable((observer) => {
			const srcSubscription = srcObservable.subscribe({
				next: (val) => {
					let next;
					try {
						next = mapFunc(val);
					} catch (err) {
						this.error(err);
						this.complete();
					}
					observer.next(next);
				},
				error: (err) => {
					observer.error(err);
				},
				complete: () => {
					observer.complete();
				},
			});

			return srcSubscription.unsubscribe();
		});
	};
};

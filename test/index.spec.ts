import { equal } from 'assert';
import { Locks } from '../src/Locks';

describe('Locks', function() {

    (<any>this).timeout(10000);
    this.slow(15000);

    let locks = new Locks(1);

    it('should has lock key', function() {
        let lock = locks.lock('KEY1');
        equal(lock.key, 'KEY1');
    });

    it('should has lock', (done) => {
        locks.lock('KEY2');
        locks.wait('KEY2')
             .then(() => {
                 done('passed');
             });

        setTimeout(done, 2000);
    });

    it('should can unlock', function(done) {
        locks.lock('KEY3');
        locks.wait('KEY3')
             .then(() => {
                 // to do some thing
             })
             .then(() => {
                 done();
             });

        locks.unlock('KEY3');
    });

    it('should passed, when dont has lock', function(done) {
        locks
            .wait('KEY4')
            .then(done);
    });

    it('should lock, when waitAndLock', function(done) {
        locks
            .waitAndLock('KEY5')
            .then(() => {
                equal(true, true);

                locks
                    .wait('KEY5')
                    .then(() => {
                        done('passed');
                    });
            });

        setTimeout(done, 2000);
    });


    it('should passed, after waitAndLockOnce ', function(done) {
        locks
            .waitAndLockOnce('KEY6', async () => {
                // To do something
            })
            .then(() => {
                locks
                    .wait('KEY6')
                    .then(() => {
                        done();
                    });
            });
    });

    it('should return 1 + 1 = 2, after waitAndLockOnce ', function(done) {
        locks
            .waitAndLockOnce('KEY7', async () => {
                return 1 + 1;
            })
            .then((result) => {
                equal(result, 2);
                done();
            });
    });

    it('should one by one, when has multiple wait', function(done) {
        let last = 0;
        locks.waitAndLockOnce('KEY8', () => {
            equal(last, 0);
            last = 1;
        });

        locks.waitAndLockOnce('KEY8', () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    try {
                        equal(last, 1);
                    }
                    catch (e) {
                        done(e);
                    }

                    last = 2;
                    resolve();
                }, 500);
            });
        });


        locks.waitAndLockOnce('KEY8', () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    try {
                        equal(last, 2);
                        done()
                    }
                    catch (e) {
                        done(e);
                    }

                    last = 3;
                    resolve();
                }, 100);
            });
        });
    });
});

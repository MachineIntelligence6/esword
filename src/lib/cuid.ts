

import { init } from '@paralleldrive/cuid2';


export const createCUID = init({
    random: Math.random,
    length: 15,
    // A custom fingerprint for the host environment. This is used to help
    // prevent collisions when generating ids in a distributed system.
    // fingerprint: 'a-custom-host-fingerprint',
});
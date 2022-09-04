import { appConfig } from '../appConfig';
import { sendCheckInDM } from '../utils/buttons';

sendCheckInDM(appConfig);
console.log("sent midpoint checkin to all group dms");
import {registerAs} from '@nestjs/config';

export default registerAs('application', () => ({
  gateApi: {
    key: process.env.GATE_API_KEY,
    secret: process.env.GATE_API_SECRET,
  },
}));

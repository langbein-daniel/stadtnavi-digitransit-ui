import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import TransitLeg from './TransitLeg';
import ComponentUsageExample from './ComponentUsageExample';

const RailLeg = ({ leg, ...props }) => (
  <TransitLeg mode="RAIL" leg={leg} {...props}>
    <FormattedMessage
      id="rail-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Train {routeNumber} {headSign}"
    />
  </TransitLeg>
);

const exampleLeg = t1 => ({
  realTime: false,
  stop: { zoneId: 'A' },
  transitLeg: true,
  startTime: t1 + 20000,
  endTime: t1 + 30000,
  departureDelay: 100,
  mode: 'RAIL',
  distance: 586.4621425755712,
  duration: 120,
  rentedBike: false,
  intermediatePlaces: [],
  route: { gtfsId: '123', shortName: 'P', mode: 'RAIL' },
  trip: { gtfsId: '123', tripHeadsign: 'Helsinki', pattern: { code: '123' } },
  from: { name: 'Käpylä', stop: { code: '0072' } },
  to: { name: 'Helsinki', stop: { code: '0072 ' } },
});

RailLeg.description = () => {
  const today = moment().hour(12).minute(34).second(0).valueOf();
  return (
    <div>
      <p>Displays an itinerary rail leg.</p>
      <ComponentUsageExample>
        <RailLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

RailLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};

export default RailLeg;

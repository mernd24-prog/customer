const fs = require('fs');

// We just need to check if there is any field like `return_id` or similar in a shipment object.
// To do this reliably, we can just write a quick check in ShipmentTrackingPanel:
// const isReverse = Boolean(shipment.return_id || shipment.is_return || shipment.type === 'return' || shipment.type === 'reverse' || (shipment.trackingEvents || []).some(e => e?.status?.includes?.('reverse_pickup')));


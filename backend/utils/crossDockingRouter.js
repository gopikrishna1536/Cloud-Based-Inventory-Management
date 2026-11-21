/**
 * Cross-Docking Inbound to Outbound Matching Engine
 */
class CrossDockingRouter {
  static matchShipments(inboundReceipts, pendingOutboundOrders) {
    const matches = [];

    for (const inRec of inboundReceipts) {
      for (const outOrd of pendingOutboundOrders) {
        if (inRec.sku === outOrd.sku && !inRec.matched && !outOrd.matched) {
          const matchQty = Math.min(inRec.quantity, outOrd.quantity);
          matches.push({
            sku: inRec.sku,
            inboundDocId: inRec.docId,
            outboundOrderId: outOrd.orderId,
            crossDockQuantity: matchQty,
            action: 'DIRECT_TRANSFER_STAGING_BYPASS'
          });
          inRec.quantity -= matchQty;
          outOrd.quantity -= matchQty;
          if (inRec.quantity === 0) inRec.matched = true;
          if (outOrd.quantity === 0) outOrd.matched = true;
        }
      }
    }

    return matches;
  }
}

module.exports = CrossDockingRouter;

import React from 'react';

function DeployContractSuccess({ contract }) {
  return (
    <span>
      Contract successfully deployed at:{' '}
      <a
        rel="noopener noreferrer"
        href={`https://etherscan.io/address/${contract.address}`}
        target="_blank"
      >
        {contract.address}
      </a>
    </span>
  );
}

export default DeployContractSuccess;

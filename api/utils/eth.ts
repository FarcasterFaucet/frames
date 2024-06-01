/**
 * Prepares the Ethereum address by removing the 0x prefix and converting it to lowercase.
 * @param address Ethereum address
 */
export function prepareEthAddress(address: string): string {
  address = address.replace(/^0x/, '')

  return address.toLowerCase()
}

export const SERVICES = [
  {
    id: "notion",
    name: "Notion AI",
    address: "0x3caae16ffc210c7c398ef5c889a35bb8d4684424",
    token: "ETH",
    amount: "0.001",
    period: 10,
    mode: "EIP712",
    description: "AI-powered workspace assistant"
  },
  {
    id: "netflix",
    name: "Netflix Pro",
    address: "0x1be41833c32cdb8752a3a4d7e6ea575861782e05",
    token: "ETH",
    amount: "0.002",
    period: 30 * 24 * 60 * 60,
    mode: "EIP712",
    description: "Premium streaming subscription"
  },
  {
    id: "spotify",
    name: "Spotify Premium",
    address: "0x5a9f7b778cda4c4f5c442be0a9d0b7f4d2f03f7e",
    token: "ETH",
    amount: "0.0015",
    period: 30 * 24 * 60 * 60,
    mode: "EIP712",
    description: "Ad-free music streaming"
  }
]

export const SERVICE_BY_ADDRESS: Record<string, (typeof SERVICES)[number]> =
  SERVICES.reduce((acc, svc) => {
    acc[svc.address.toLowerCase()] = svc
    return acc
  }, {} as Record<string, (typeof SERVICES)[number]>)

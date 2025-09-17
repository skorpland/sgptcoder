export const domain = (() => {
  if ($app.stage === "production") return "sgptcoder.ai"
  if ($app.stage === "dev") return "dev.sgptcoder.ai"
  return `${$app.stage}.dev.sgptcoder.ai`
})()

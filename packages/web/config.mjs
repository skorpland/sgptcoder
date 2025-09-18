const stage = process.env.SGPT_STAGE || "dev"

export default {
  url: stage === "production" ? "https://sgptcoder.ai" : `https://${stage}.sgptcoder.ai`,
  console: stage === "production" ? "https://sgptcoder.ai/auth" : `https://${stage}.sgptcoder.ai/auth`,
  email: "contact@anoma.ly",
  socialCard: "https://social-cards.skorpland.com",
  github: "https://github.com/skorpland/sgptcoder",
  discord: "https://sgptcoder.ai/discord",
  headerLinks: [
    { name: "Home", url: "/" },
    { name: "Docs", url: "/docs/" },
  ],
}

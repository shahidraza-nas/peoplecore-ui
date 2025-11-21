export const siteConfig = {
  name: "PeopleCore",
  description: "Employee Management and Real-time Chat Application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/shahidraza-nas/peoplecore-ui",
  },
};

export type SiteConfig = typeof siteConfig;

<div align="center">

```
██╗████████╗    ██╗  ██╗███████╗██╗     ██████╗ ██████╗ ███████╗███████╗██╗  ██╗
██║╚══██╔══╝    ██║  ██║██╔════╝██║     ██╔══██╗██╔══██╗██╔════╝██╔════╝██║ ██╔╝
██║   ██║       ███████║█████╗  ██║     ██████╔╝██║  ██║█████╗  ███████╗█████╔╝ 
██║   ██║       ██╔══██║██╔══╝  ██║     ██╔═══╝ ██║  ██║██╔══╝  ╚════██║██╔═██╗ 
██║   ██║       ██║  ██║███████╗███████╗██║     ██████╔╝███████╗███████║██║  ██╗
╚═╝   ╚═╝       ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
```

# 🖥️ IT Helpdesk & Property Management System

**A unified support and operations platform built for modern IT teams and company-wide management.**

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)](/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange?style=flat-square)](CONTRIBUTING.md)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](/)

</div>

---

## 📌 Overview

**IT Helpdesk** is an all-in-one internal platform designed to streamline IT support operations while also serving as a **Property Management System (PMS)** for the company. It empowers helpdesk staff to manage tickets efficiently, keep end-users informed, and maintain a centralized knowledge base — all from a single dashboard.

Whether it's a password reset or a company-wide system outage, this system has it covered.

---

## ✨ Features

### 🎫 Ticket Management
- Submit, track, and resolve support tickets with ease
- Assign tickets to agents and set priority levels
- Real-time status updates (Open, In Progress, Resolved, Closed)
- Full ticket history and audit trail

### 🏢 Property Management System (PMS)
- Manage company assets, facilities, and resources
- Track equipment assignments and maintenance schedules
- Generate reports on asset utilization and status

### 📚 Knowledge Base
- Searchable repository of guides, FAQs, and solutions
- Categorized articles for quick self-service resolution
- Reduce repetitive tickets by empowering users to help themselves

### 📧 Email Notifications
- Automatic email alerts on ticket creation, updates, and resolution
- Notify agents upon ticket assignment
- Keep end-users in the loop at every step — no more chasing for updates

### 📢 Announcement & Issue Board
- Broadcast **major incident announcements** company-wide
- Notify all users of system outages, scheduled maintenance, or critical issues
- Prevent ticket floods by proactively communicating known problems
- Time-stamped announcements with severity levels (Info / Warning / Critical)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- **PHP** >= 8.1
- **Composer**
- **Node.js** >= 16 & **NPM**
- **MySQL** or **MariaDB**
- A configured **mail driver** (SMTP, Mailgun, etc.)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/it-helpdesk.git
cd it-helpdesk
```

**2. Install dependencies**
```bash
composer install
npm install && npm run build
```

**3. Set up environment**
```bash
cp .env.example .env
php artisan key:generate
```

**4. Configure your `.env` file**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=helpdesk_db
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=helpdesk@yourcompany.com
MAIL_FROM_NAME="IT Helpdesk"
```

**5. Run migrations and seed data**
```bash
php artisan migrate --seed
```

**6. Start the development server**
```bash
php artisan serve
```

Visit `http://localhost:8000` — you're live! 🎉

---

## 🖼️ Screenshots

> *(Add screenshots of your dashboard, ticket view, knowledge base, and announcement board here)*

| Dashboard | Ticket View | Knowledge Base |
|-----------|-------------|----------------|
| ![Dashboard](screenshots/dashboard.png) | ![Tickets](screenshots/tickets.png) | ![KB](screenshots/kb.png) |

---

## 📢 Announcement System — How It Works

The **Announcement Board** is designed for major incidents and company-wide notices. When a critical issue is detected:

1. An admin or IT lead creates an announcement with a **severity level**
2. All users receive an **email notification** immediately
3. A banner is displayed on the helpdesk dashboard until the issue is resolved
4. The announcement is archived for future reference

> 💡 **Pro tip:** Use announcements proactively during planned maintenance to reduce ticket volume.

---

## 📬 Email Notification Flow

```
User submits ticket
        ↓
  Email sent to user (Ticket Received ✅)
        ↓
  Email sent to assigned agent (New Assignment 🔔)
        ↓
  Agent updates ticket status
        ↓
  Email sent to user (Status Update 📋)
        ↓
  Ticket resolved → Email sent (Resolution Confirmation 🎉)
```

---

## 🔐 Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — users, tickets, PMS, announcements, KB |
| **Helpdesk Agent** | Manage & resolve tickets, write KB articles |
| **PMS Staff** | Access property and asset management modules |
| **End User** | Submit tickets, view KB, receive notifications |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel (PHP) |
| Frontend | Blade / Livewire / Alpine.js |
| Database | MySQL |
| Email | Laravel Notifications + SMTP |
| Styling | Tailwind CSS |
| Auth | Laravel Breeze / Jetstream |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'Add: your feature description'`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

Please follow the existing code style and include tests where applicable.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Developed and maintained with purpose by the **IT Team**.  
For internal support or questions, reach out through the helpdesk itself — that's what it's for. 😄

---

<div align="center">

**⭐ If this project helped you, give it a star!**

*Built to make IT support less painful, one ticket at a time.*

</div>

document.addEventListener("DOMContentLoaded", () => {
    
    // DOM Node Elements
    const authPanel = document.getElementById("auth-panel");
    const dashboardPanel = document.getElementById("dashboard-panel");
    const authForm = document.getElementById("auth-form");
    const authKeyInput = document.getElementById("auth-key-input");
    const messagesContainer = document.getElementById("messages-container");
    const btnLogout = document.getElementById("btn-logout");
    const btnRefresh = document.getElementById("btn-refresh");
    
    const metricTotal = document.getElementById("metric-total");
    const metricUnread = document.getElementById("metric-unread");
    const metricSenders = document.getElementById("metric-senders");
    const toastContainer = document.getElementById("toast-container");

    // Initialize Lucide Icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Helper: Toast Notifications
    const launchToast = (message, isSuccess = true) => {
        const toast = document.createElement("div");
        toast.className = "toast-popup";
        
        const iconName = isSuccess ? "check-circle" : "alert-triangle";
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        if (typeof lucide !== "undefined") {
            lucide.createIcons({
                attrs: { class: 'toast-icon' }
            });
        }
        
        setTimeout(() => toast.classList.add("visible"), 50);
        
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.remove(), 600);
        }, 3000);
    };

    // Helper: Retrieve Key
    const getAccessKey = () => sessionStorage.getItem("portfolio_admin_key");

    // Flow: Check authentication status
    const checkAuth = () => {
        const key = getAccessKey();
        if (key) {
            authPanel.style.display = "none";
            dashboardPanel.style.display = "flex";
            btnLogout.style.display = "inline-flex";
            loadMessages();
        } else {
            authPanel.style.display = "block";
            dashboardPanel.style.display = "none";
            btnLogout.style.display = "none";
            messagesContainer.innerHTML = "";
        }
    };

    // Flow: Load messages from Express endpoint
    const loadMessages = async () => {
        const key = getAccessKey();
        if (!key) return;

        try {
            const res = await fetch("/api/admin/messages", {
                headers: {
                    "Authorization": `Bearer ${key}`
                }
            });

            if (res.status === 401) {
                // Key is invalid
                sessionStorage.removeItem("portfolio_admin_key");
                launchToast("Invalid or expired session access key.", false);
                checkAuth();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to retrieve messages log.");
            }

            const messages = await res.json();
            renderDashboard(messages);
        } catch (err) {
            console.error(err);
            launchToast("Could not communicate with the backend server.", false);
        }
    };

    // Flow: Render messages and statistics
    const renderDashboard = (messages) => {
        // Clear old contents
        messagesContainer.innerHTML = "";

        // Calculate statistics
        const total = messages.length;
        const uniqueSenders = new Set(messages.map(m => m.email.toLowerCase())).size;
        
        // Simple unread/recent count (messages within the last 24 hours)
        const recentCount = messages.filter(m => {
            const diffHours = (Date.now() - new Date(m.timestamp).getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
        }).length;

        // Update metric summaries
        metricTotal.textContent = total;
        metricUnread.textContent = recentCount;
        metricSenders.textContent = uniqueSenders;

        if (total === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-log-state">
                    <i data-lucide="inbox" class="empty-log-icon"></i>
                    <h3>No Messages Found</h3>
                    <p>Submissions from the main website contact form will appear here.</p>
                </div>
            `;
            if (typeof lucide !== "undefined") {
                lucide.createIcons({
                    attrs: { class: 'empty-log-icon' }
                });
            }
            return;
        }

        // Generate listings
        messages.forEach(msg => {
            const card = document.createElement("div");
            card.className = "message-row-card";
            card.setAttribute("data-id", msg.id);

            const localTimeStr = new Date(msg.timestamp).toLocaleString();

            card.innerHTML = `
                <div class="msg-meta-side">
                    <span class="msg-name">${escapeHTML(msg.name)}</span>
                    <a href="mailto:${msg.email}" class="msg-email">${escapeHTML(msg.email)}</a>
                    <span class="msg-time">${localTimeStr}</span>
                </div>
                <div class="msg-body-side">${escapeHTML(msg.message)}</div>
                <div class="msg-action-side">
                    <button class="btn-delete-msg" title="Delete Inquiry">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            // Bind Delete button
            const deleteBtn = card.querySelector(".btn-delete-msg");
            deleteBtn.addEventListener("click", () => handleDelete(msg.id));

            messagesContainer.appendChild(card);
        });

        // Re-run Lucide
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    };

    // Flow: Delete message by ID
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this message? This action is permanent.")) {
            return;
        }

        const key = getAccessKey();
        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${key}`
                }
            });

            if (res.ok) {
                launchToast("Message removed successfully.");
                loadMessages();
            } else {
                const data = await res.json();
                launchToast(data.error || "Failed to remove message.", false);
            }
        } catch (err) {
            console.error(err);
            launchToast("Could not communicate with the server.", false);
        }
    };

    // Helper: Escaping utility to prevent XSS in admin dashboard
    const escapeHTML = (str) => {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Event: Form Submission Access Check
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const key = authKeyInput.value.trim();
            if (key) {
                sessionStorage.setItem("portfolio_admin_key", key);
                authKeyInput.value = "";
                checkAuth();
            }
        });
    }

    // Event: Logout handler
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("portfolio_admin_key");
            launchToast("Logged out successfully.");
            checkAuth();
        });
    }

    // Event: Refresh trigger
    if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
            loadMessages();
            launchToast("Log list reloaded.");
        });
    }

    // Initial check on load
    checkAuth();
});

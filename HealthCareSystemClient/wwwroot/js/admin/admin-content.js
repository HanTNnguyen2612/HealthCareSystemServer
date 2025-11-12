// Admin Content Management functionality
let articles = []
let filteredArticles = []
let currentPage = 1
const articlesPerPage = 12
let quill
let currentView = "grid"

document.addEventListener("DOMContentLoaded", () => {
    loadArticles()
    setupSearch()
    initializeEditor()
})

function initializeEditor() {
    quill = new Quill("#editor", {
        theme: "snow",
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ align: [] }],
                ["link", "image", "video"],
                ["clean"],
            ],
        },
    })
}

function loadArticles() {
    // Sample articles data
    articles = [
        {
            id: 1,
            title: "10 Essential Health Tips for a Better Life",
            summary: "Discover simple yet effective ways to improve your overall health and wellbeing.",
            content: "<p>Health is wealth, and maintaining good health should be everyone's priority...</p>",
            category: "health-tips",
            status: "published",
            author: "Admin User",
            publishDate: "2024-01-15",
            lastModified: "2024-01-15",
            views: 1250,
            likes: 89,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["health", "wellness", "lifestyle"],
        },
        {
            id: 2,
            title: "Understanding Mental Health in the Digital Age",
            summary: "How technology affects our mental wellbeing and strategies to maintain balance.",
            content: "<p>In today's digital world, mental health has become more important than ever...</p>",
            category: "mental-health",
            status: "published",
            author: "Content Editor",
            publishDate: "2024-01-12",
            lastModified: "2024-01-14",
            views: 890,
            likes: 67,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["mental-health", "technology", "balance"],
        },
        {
            id: 3,
            title: "Nutrition Guide for Busy Professionals",
            summary: "Quick and healthy meal ideas for people with demanding schedules.",
            content: "<p>Maintaining proper nutrition while managing a busy career can be challenging...</p>",
            category: "nutrition",
            status: "draft",
            author: "Admin User",
            publishDate: null,
            lastModified: "2024-01-18",
            views: 0,
            likes: 0,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["nutrition", "busy-lifestyle", "meal-planning"],
        },
        {
            id: 4,
            title: "The Benefits of Regular Exercise",
            summary: "Why physical activity is crucial for both physical and mental health.",
            content: "<p>Regular exercise is one of the most important things you can do for your health...</p>",
            category: "fitness",
            status: "published",
            author: "Admin User",
            publishDate: "2024-01-10",
            lastModified: "2024-01-10",
            views: 2100,
            likes: 156,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["fitness", "exercise", "health"],
        },
        {
            id: 5,
            title: "Latest Advances in Medical Technology",
            summary: "Exploring cutting-edge medical innovations that are changing healthcare.",
            content: "<p>Medical technology continues to evolve at a rapid pace...</p>",
            category: "medical-news",
            status: "archived",
            author: "Content Editor",
            publishDate: "2024-01-05",
            lastModified: "2024-01-08",
            views: 750,
            likes: 45,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["medical-technology", "innovation", "healthcare"],
        },
        {
            id: 6,
            title: "Wellness Practices for Better Sleep",
            summary: "Natural methods to improve sleep quality and establish healthy sleep habits.",
            content: "<p>Quality sleep is fundamental to good health and wellbeing...</p>",
            category: "wellness",
            status: "published",
            author: "Admin User",
            publishDate: "2024-01-08",
            lastModified: "2024-01-08",
            views: 1450,
            likes: 98,
            image: "/placeholder.svg?height=200&width=300",
            tags: ["wellness", "sleep", "health-habits"],
        },
    ]

    filteredArticles = [...articles]
    renderArticles()
    renderPagination()
}

function setupSearch() {
    const searchInput = document.getElementById("searchInput")
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()
        filteredArticles = articles.filter(
            (article) =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.summary.toLowerCase().includes(searchTerm) ||
                article.category.toLowerCase().includes(searchTerm) ||
                article.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        )
        currentPage = 1
        renderArticles()
        renderPagination()
    })
}

function applyContentFilters() {
    const categoryFilter = document.getElementById("categoryFilter").value
    const statusFilter = document.getElementById("statusFilter").value
    const authorFilter = document.getElementById("authorFilter").value
    const dateRangeFilter = document.getElementById("dateRangeFilter").value

    filteredArticles = articles.filter((article) => {
        let matches = true

        if (categoryFilter && article.category !== categoryFilter) matches = false
        if (statusFilter && article.status !== statusFilter) matches = false
        if (authorFilter && !article.author.toLowerCase().includes(authorFilter)) matches = false

        // Date filtering logic
        if (dateRangeFilter && article.publishDate) {
            const articleDate = new Date(article.publishDate)
            const now = new Date()

            switch (dateRangeFilter) {
                case "today":
                    matches = matches && articleDate.toDateString() === now.toDateString()
                    break
                case "week":
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    matches = matches && articleDate >= weekAgo
                    break
                case "month":
                    matches =
                        matches && articleDate.getMonth() === now.getMonth() && articleDate.getFullYear() === now.getFullYear()
                    break
                case "year":
                    matches = matches && articleDate.getFullYear() === now.getFullYear()
                    break
            }
        }

        return matches
    })

    currentPage = 1
    renderArticles()
    renderPagination()
}

function clearContentFilters() {
    document.getElementById("categoryFilter").value = ""
    document.getElementById("statusFilter").value = ""
    document.getElementById("authorFilter").value = ""
    document.getElementById("dateRangeFilter").value = ""
    document.getElementById("searchInput").value = ""

    filteredArticles = [...articles]
    currentPage = 1
    renderArticles()
    renderPagination()
}

function renderArticles() {
    const startIndex = (currentPage - 1) * articlesPerPage
    const endIndex = startIndex + articlesPerPage
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    if (currentView === "grid") {
        renderArticlesGrid(paginatedArticles)
    } else {
        renderArticlesList(paginatedArticles)
    }
}

function renderArticlesGrid(articles) {
    const grid = document.getElementById("articlesGrid")
    grid.innerHTML = articles
        .map(
            (article) => `
        <div class="article-card">
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}" class="img-fluid">
                <div class="article-status">
                    <span class="badge bg-${getStatusBadgeColor(article.status)}">${article.status}</span>
                </div>
            </div>
            <div class="article-content">
                <div class="article-category">
                    <span class="badge bg-primary">${formatCategory(article.category)}</span>
                </div>
                <h6 class="article-title">${article.title}</h6>
                <p class="article-summary">${article.summary}</p>
                <div class="article-meta">
                    <small class="text-muted">
                        <i class="fas fa-user"></i> ${article.author}
                        ${article.publishDate ? `<i class="fas fa-calendar ms-2"></i> ${formatDate(article.publishDate)}` : ""}
                    </small>
                </div>
                <div class="article-stats">
                    <span class="stat-item">
                        <i class="fas fa-eye"></i> ${article.views}
                    </span>
                    <span class="stat-item">
                        <i class="fas fa-heart"></i> ${article.likes}
                    </span>
                </div>
            </div>
            <div class="article-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="editArticle(${article.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="viewArticle(${article.id})" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="duplicateArticle(${article.id})" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle(${article.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")
}

function renderArticlesList(articles) {
    const list = document.getElementById("articlesList")
    list.innerHTML = articles
        .map(
            (article) => `
        <div class="article-list-item">
            <div class="article-list-image">
                <img src="${article.image}" alt="${article.title}" class="img-fluid rounded">
            </div>
            <div class="article-list-content">
                <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="badge bg-primary">${formatCategory(article.category)}</span>
                    <span class="badge bg-${getStatusBadgeColor(article.status)}">${article.status}</span>
                </div>
                <h6 class="article-list-title">${article.title}</h6>
                <p class="article-list-summary">${article.summary}</p>
                <div class="article-list-meta">
                    <small class="text-muted">
                        By ${article.author} 
                        ${article.publishDate ? `• ${formatDate(article.publishDate)}` : "• Draft"}
                        • ${article.views} views • ${article.likes} likes
                    </small>
                </div>
            </div>
            <div class="article-list-actions">
                <div class="btn-group-vertical" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editArticle(${article.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewArticle(${article.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="duplicateArticle(${article.id})" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle(${article.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `,
        )
        .join("")
}

function renderPagination() {
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
    const pagination = document.getElementById("articlesPagination")

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `

    pagination.innerHTML = paginationHTML
}

function changePage(page) {
    if (page >= 1 && page <= Math.ceil(filteredArticles.length / articlesPerPage)) {
        currentPage = page
        renderArticles()
        renderPagination()
    }
}

function toggleView(view) {
    currentView = view

    // Update button states
    document.querySelectorAll(".btn-group .btn").forEach((btn) => {
        btn.classList.remove("active")
    })
    event.target.classList.add("active")

    // Show/hide views
    if (view === "grid") {
        document.getElementById("articlesGrid").style.display = "grid"
        document.getElementById("articlesList").style.display = "none"
    } else {
        document.getElementById("articlesGrid").style.display = "none"
        document.getElementById("articlesList").style.display = "block"
    }

    renderArticles()
}

function showCreateArticle() {
    document.getElementById("articlesListView").style.display = "none"
    document.getElementById("articleEditor").style.display = "block"
    document.getElementById("editorTitle").textContent = "Create New Article"

    // Reset form
    document.getElementById("articleForm").reset()
    document.getElementById("articleId").value = ""
    quill.setContents([])
    hideImagePreview()
}

function hideArticleEditor() {
    document.getElementById("articleEditor").style.display = "none"
    document.getElementById("articlesListView").style.display = "block"
}

function editArticle(articleId) {
    const article = articles.find((a) => a.id === articleId)
    if (!article) return

    // Show editor
    document.getElementById("articlesListView").style.display = "none"
    document.getElementById("articleEditor").style.display = "block"
    document.getElementById("editorTitle").textContent = "Edit Article"

    // Populate form
    document.getElementById("articleId").value = article.id
    document.getElementById("articleTitle").value = article.title
    document.getElementById("articleCategory").value = article.category
    document.getElementById("articleSummary").value = article.summary
    document.getElementById("articleTags").value = article.tags.join(", ")
    document.getElementById("articleAuthor").value = article.author
    document.getElementById("articleStatus").value = article.status

    // Set editor content
    quill.root.innerHTML = article.content

    // Show image preview if exists
    if (article.image) {
        showImagePreview(article.image)
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file")
        return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
        showImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
}

function showImagePreview(src) {
    document.querySelector(".upload-placeholder").style.display = "none"
    document.getElementById("imagePreview").style.display = "block"
    document.getElementById("previewImg").src = src
}

function hideImagePreview() {
    document.querySelector(".upload-placeholder").style.display = "block"
    document.getElementById("imagePreview").style.display = "none"
    document.getElementById("articleImage").value = ""
}

function removeImage() {
    hideImagePreview()
}

function saveAsDraft() {
    const articleData = getArticleFormData()
    articleData.status = "draft"
    saveArticle(articleData)
}

function publishArticle() {
    const articleData = getArticleFormData()

    // Validate required fields
    if (!articleData.title || !articleData.category || !quill.getText().trim()) {
        alert("Please fill in all required fields")
        return
    }

    articleData.status = "published"
    articleData.publishDate = new Date().toISOString().split("T")[0]
    saveArticle(articleData)
}

function getArticleFormData() {
    return {
        id: document.getElementById("articleId").value ? Number.parseInt(document.getElementById("articleId").value) : null,
        title: document.getElementById("articleTitle").value,
        category: document.getElementById("articleCategory").value,
        summary: document.getElementById("articleSummary").value,
        content: quill.root.innerHTML,
        tags: document
            .getElementById("articleTags")
            .value.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        author: document.getElementById("articleAuthor").value,
        status: document.getElementById("articleStatus").value,
        image: document.getElementById("previewImg").src || "/placeholder.svg?height=200&width=300",
        lastModified: new Date().toISOString().split("T")[0],
    }
}

function saveArticle(articleData) {
    if (articleData.id) {
        // Update existing article
        const index = articles.findIndex((a) => a.id === articleData.id)
        if (index !== -1) {
            articles[index] = { ...articles[index], ...articleData }
        }
    } else {
        // Create new article
        articleData.id = articles.length + 1
        articleData.views = 0
        articleData.likes = 0
        articles.push(articleData)
    }

    filteredArticles = [...articles]
    renderArticles()
    renderPagination()
    hideArticleEditor()

    alert(`Article ${articleData.status === "published" ? "published" : "saved as draft"} successfully!`)
}

function viewArticle(articleId) {
    const article = articles.find((a) => a.id === articleId)
    if (!article) return

    // Open article in new window/tab (in a real app, this would navigate to the article page)
    alert(`Viewing article: ${article.title}\n\nThis would open the article in a new tab in a real application.`)
}

function duplicateArticle(articleId) {
    const article = articles.find((a) => a.id === articleId)
    if (!article) return

    const duplicatedArticle = {
        ...article,
        id: articles.length + 1,
        title: `${article.title} (Copy)`,
        status: "draft",
        publishDate: null,
        views: 0,
        likes: 0,
        lastModified: new Date().toISOString().split("T")[0],
    }

    articles.push(duplicatedArticle)
    filteredArticles = [...articles]
    renderArticles()
    renderPagination()

    alert("Article duplicated successfully!")
}

function deleteArticle(articleId) {
    if (confirm("Are you sure you want to delete this article?")) {
        articles = articles.filter((a) => a.id !== articleId)
        filteredArticles = [...articles]
        renderArticles()
        renderPagination()
        alert("Article deleted successfully!")
    }
}

function exportArticles(format) {
    if (format === "csv") {
        const headers = ["ID", "Title", "Category", "Status", "Author", "Publish Date", "Views", "Likes"]
        const csvContent = [
            headers.join(","),
            ...filteredArticles.map((article) =>
                [
                    article.id,
                    `"${article.title}"`,
                    article.category,
                    article.status,
                    article.author,
                    article.publishDate || "N/A",
                    article.views,
                    article.likes,
                ].join(","),
            ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "articles.csv"
        a.click()
        window.URL.revokeObjectURL(url)
    }
}

function getStatusBadgeColor(status) {
    const colors = {
        published: "success",
        draft: "warning",
        archived: "secondary",
    }
    return colors[status] || "secondary"
}

function formatCategory(category) {
    return category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.clear()
        window.location.href = "index.html"
    }
}

// Declare Quill variable before using it
const Quill = window.Quill

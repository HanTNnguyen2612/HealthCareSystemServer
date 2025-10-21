using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Article
{
    public int ArticleId { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public DateTime? PublishedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? ArticleImg { get; set; }
}

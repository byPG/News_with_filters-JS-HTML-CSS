'use strict';

const selectFilterByType = document.getElementById('filter_by_type');
const selectFilterByYear= document.getElementById('filter_by_year');
const articlesContainer = document.getElementById('articles_container');
const loadMoreBtn = document.getElementById('load_more_btn');
const chipsControls = document.getElementById('chips_controls')


//object for state of articles
const stateArticles = { 
    allArticles: [],
    selectedCategoryChip: 'all',
    selectedType: 'all',
    selectedYear: 'all',
    visibleCount: 12
};

//fetch articles from source
async function fetchArticles() {
    const sourceOfData =  "./data/pressReleases.json";
   
    try { 
        const response = await fetch(sourceOfData);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const results = await response.json();
        return results;

    } catch (error) {
        console.error('Error fetching articles:', error);
        alert('Error fetching article. Please try again later.');
        throw error;
    }
}

//creating singular card for an article
function articleSingularCard (article) {

        const cardArticle = document.createElement('article');
        cardArticle.classList.add('article_card');

        if(article.imageUrl) {
        const imgArticle = document.createElement('img');
        imgArticle.src = article.imageUrl; 
        imgArticle.alt = article.title;
        imgArticle.classList.add('img_article'); 
        cardArticle.appendChild(imgArticle); }
        
        const dateArticle = document.createElement('span');
        dateArticle.textContent = article.publishedAt || 'No date';
        dateArticle.classList.add('article_date');

        const title = document.createElement('h2');
        title.textContent = article.title || 'No title';
        title.classList.add('title_article');

        const articleExcerpt = document.createElement('p');
        articleExcerpt.textContent = article.excerpt || 'No text';
        articleExcerpt.classList.add('excerpt_text');

        const readMoreBtn = document.createElement('a');
        readMoreBtn.textContent = 'Read more ';
        readMoreBtn.href = article.url || '#';
        readMoreBtn.classList.add('read_more_btn');

        const icon = document.createElement('i');
        icon.className = "fa fa-angle-right";

        readMoreBtn.appendChild(icon);
   
        cardArticle.appendChild(dateArticle);
        cardArticle.appendChild(title);
        cardArticle.appendChild(articleExcerpt);
        cardArticle.appendChild(readMoreBtn)

        return cardArticle;

}

function renderArticles(articles) {
    articlesContainer.innerHTML = '';

    articles.forEach(article => {
        const articleCard = articleSingularCard(article);
        articlesContainer.appendChild(articleCard);
    });
}

//Type Filter - dynamic
function filterTypeOptions() {
    const allTypes = stateArticles.allArticles.map((article) => article.type);
    const uniqueTypes = [...new Set(allTypes)]; //set - tylko unikalne wartosci

    uniqueTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;

        selectFilterByType.appendChild(option);
    });
}

//Year filter - dynamic
function filterYearOptions() {
    const allYears = stateArticles.allArticles.map((article) => {
        return new Date(article.publishedAt).getFullYear(); // .getFullYear pobiera cały rok
    });

    const uniqueYears = [...new Set(allYears)].sort((a, b) => b - a); //spread do nowej tablic, set - usuwamy duplikaty, sort - sortujemy malejąco

    uniqueYears.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;

        selectFilterByYear.appendChild(option);
    });
}




//Init function - starting
async function initRendering() {
    const articles = await fetchArticles();
    stateArticles.allArticles = articles;

    filterTypeOptions();
    filterYearOptions()

    const initArticles = stateArticles.allArticles.slice(0, stateArticles.visibleCount);
    renderArticles(initArticles);

    // console.log('state:', stateArticles);
}
initRendering();

//Load more btn
function handleLoadMore() {
    stateArticles.visibleCount += 6;

    const visibleArticles = stateArticles.allArticles.slice(0, stateArticles.visibleCount);
    renderArticles(visibleArticles);
}

loadMoreBtn.addEventListener('click', handleLoadMore);


//Filter by chips controlls
chipsControls.addEventListener('click', (event) => {
    
    const clickedChip = event.target.closest('[data-category]');
    if (!clickedChip) return; 

    stateArticles.selectedCategoryChip = clickedChip.dataset.category;

    // stateArticles.visibleCount = 9;
    // console.log(stateArticles.selectedCategoryChip);

    const filteredArticlesByChips = stateArticles.allArticles.filter((item) => {
    if (stateArticles.selectedCategoryChip === 'all') {
        return true;
    }

    return item.category === stateArticles.selectedCategoryChip;
});
renderArticles(filteredArticlesByChips);

});

//Select Filters
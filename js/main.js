'use strict';

const selectFilterByType = document.getElementById('filter_by_type');
const selectFilterByYear= document.getElementById('filter_by_year');
const articlesContainer = document.getElementById('articles_container');
const loadMoreBtn = document.getElementById('load_more_btn');
const chipsControlsContainer = document.getElementById('chips_controls')
const chipsControls = document.querySelectorAll('.chip');

//object for state of articles
const stateArticles = { 
    allArticles: [],
    selectedCategoryChip: 'all',
    selectedType: 'all',
    selectedYear: 'all',
    visibleCount: 9
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

//Init function - starting
async function initRendering() {
    const articles = await fetchArticles();
    stateArticles.allArticles = articles;

    filterByTypeOptions();
    filterByYearOptions();

    renderFilteredVisibleArticles();
}
initRendering();

//rendering articles in UI
function renderArticles(articles) {
    articlesContainer.innerHTML = '';

    articles.forEach(article => {
        const articleCard = articleSingularCard(article); //ccreate each card with article from source (array of articles)
        articlesContainer.appendChild(articleCard);
    });
}


//Type Filter in select
function filterByTypeOptions() {
    const allTypes = stateArticles.allArticles.map((article) => article.type);
    const uniqueTypes = [...new Set(allTypes)]; //set - tylko unikalne wartosci

    //creating options in select tag    
    uniqueTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;

        selectFilterByType.appendChild(option);
    });
}

selectFilterByType.addEventListener('change', (event) => {
    stateArticles.selectedType = event.target.value;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles();
});

//Year filter in select
function filterByYearOptions() {
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

selectFilterByYear.addEventListener('change', (event) => {
    stateArticles.selectedYear = event.target.value;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles();
});



// return articles if they match to chosen filters
function filterArticles() {
    return stateArticles.allArticles.filter((item) => {

        const matchCategory =  stateArticles.selectedCategoryChip === 'all' || item.category === stateArticles.selectedCategoryChip;

        const matchType = stateArticles.selectedType === 'all' || item.type === stateArticles.selectedType;

        const matchYear = stateArticles.selectedYear === 'all' || new Date(item.publishedAt).getFullYear().toString() === stateArticles.selectedYear;

        return matchCategory && matchType && matchYear;
    });
}


function renderFilteredVisibleArticles() {
    const filteredArticles = filterArticles();
    const visibleArticles = filteredArticles.slice(0, stateArticles.visibleCount);

    renderArticles(visibleArticles);
}


//Load more articles btn
function handleLoadMore() {
    stateArticles.visibleCount += 6;
    renderFilteredVisibleArticles();
}

loadMoreBtn.addEventListener('click', handleLoadMore);


//Filter by chips controlls 1
chipsControlsContainer.addEventListener('click', (event) => {
    
    const clickedChip = event.target.closest('[data-category]');
    if (!clickedChip) return; 

      chipsControls.forEach((chip) => {
        chip.classList.remove('active');
    });

    clickedChip.classList.add('active');

    stateArticles.selectedCategoryChip = clickedChip.dataset.category;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles();
});

'use strict';

const selectFilterByType = document.getElementById('filter_by_type');
const selectFilterByYear= document.getElementById('filter_by_year');
const articlesContainer = document.getElementById('articles_container');
const articlesBox = document.querySelector('.articles_box');
const loadMoreBtn = document.getElementById('load_more_btn');
const chipsControlsContainer = document.getElementById('chips_controls');
const chipsControls = document.querySelectorAll('.chip');
const emptyStateHandle = document.getElementById('empty_state');


//object for state of articles;
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

//function for formating date
function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', '');
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
        dateArticle.textContent = formatDate(article.publishedAt) || 'No date';
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


//rendering card in UI
function renderArticles(articles) {
    articlesContainer.innerHTML = ''; //delete old card before rendering

    articles.forEach(article => {
        const articleCard = articleSingularCard(article); //ccreate each card with article from source (array of articles)
        articlesContainer.appendChild(articleCard);
    });
}


// return articles if they match to chosen filters
function filterArticles() {
    return stateArticles.allArticles.filter((item) => {

        const matchCategory =  stateArticles.selectedCategoryChip === 'all' || item.category === stateArticles.selectedCategoryChip; // true lub false
        const matchType = stateArticles.selectedType === 'all' || item.type === stateArticles.selectedType;
        const matchYear = stateArticles.selectedYear === 'all' || new Date(item.publishedAt).getFullYear().toString() === stateArticles.selectedYear; //create date and change to string

        return matchCategory && matchType && matchYear; // if everything matches = true
    });
}


// render after filters
function renderFilteredVisibleArticles() {
    const filteredArticles = filterArticles();
    const visibleArticles = filteredArticles.slice(0, stateArticles.visibleCount);

        if (filteredArticles.length === 0) {
        articlesContainer.innerHTML = '';
        emptyStateHandle.classList.remove('hidden');
        loadMoreBtn.style.display = 'none';

        articlesBox.classList.remove('show_gradient');
        return;
        }

    emptyStateHandle.classList.add('hidden');
    renderArticles(visibleArticles);


    if (stateArticles.visibleCount >= filteredArticles.length) { //hide the "load more" btn
        loadMoreBtn.style.display = 'none';
        articlesBox.classList.remove('show_gradient');
    } else {
        loadMoreBtn.style.display = 'block';
        articlesBox.classList.add('show_gradient');
    }
}


//filter by chips controlls - "All releases", "Regulatory", "Non Regulatory"
chipsControlsContainer.addEventListener('click', (event) => {
    
    const clickedChip = event.target.closest('[data-category]'); //event delegation mechanism
    if (!clickedChip) return; 

      chipsControls.forEach((chip) => {
        chip.classList.remove('active');
    });

    clickedChip.classList.add('active'); //adding active class to the selected chip

    stateArticles.selectedCategoryChip = clickedChip.dataset.category;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles(); //take current data (after changing them) from that function
});


//filter by type (in select) - create options in dropdown
function filterByTypeOptions() {
    const allTypes = stateArticles.allArticles.map((article) => article.type); //derive all types fro articles
    const uniqueTypes = [...new Set(allTypes)]; //set - tylko unikalne wartosci

    //creating options in select tag    
    uniqueTypes.forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;

        selectFilterByType.appendChild(option);
    });
}
//filtering
selectFilterByType.addEventListener('change', (event) => {
    stateArticles.selectedType = event.target.value;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles();
});


//filter by year (in select) - create options in dropdown
function filterByYearOptions() {
    const allYears = stateArticles.allArticles.map((article) => {
       return new Date(article.publishedAt).getFullYear();// .getFullYear tylko cały rok
    });

    const uniqueYears = [...new Set(allYears)].sort((a, b) => a + b); //spread do nowej tablic, set - usuwamy duplikaty, sort - sortujemy malejąco

    uniqueYears.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;

        selectFilterByYear.appendChild(option);
    });
}

//filtering
selectFilterByYear.addEventListener('change', (event) => {
    stateArticles.selectedYear = event.target.value;
    stateArticles.visibleCount = 9;

    renderFilteredVisibleArticles();
});


//"load more" articles (btn) -- operates on the already filtered list
function handleLoadMore() {
    stateArticles.visibleCount += 6;
    renderFilteredVisibleArticles();
}
loadMoreBtn.addEventListener('click', handleLoadMore);


//init function - start application
async function initRendering() {
    const articles = await fetchArticles();
    stateArticles.allArticles = articles;

    filterByTypeOptions();
    filterByYearOptions();

    renderFilteredVisibleArticles();
}
initRendering();
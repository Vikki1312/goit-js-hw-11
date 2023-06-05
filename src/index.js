import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.getElementById('search-form');
const galleryEl = document.getElementById('gallery');
const btnLoad = document.querySelector('.load-more');

const simpleLightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

formEl.addEventListener('submit', onSubmit);
let page = 1;
let query = '';
let totalPage = 0;
let perPage = 40;

async function onSubmit(evt) {
  evt.preventDefault();
  btnLoad.classList.add('is-hidden');

  page = 1;
  query = evt.currentTarget.elements.searchQuery.value;
  if (!query.trim()) {
    Notiflix.Notify.failure('Enter your request', { clickToClose: true });
    return;
  }
  try {
    const response = await searchImages(query, page);
    if (response.data.hits.length === 0) {
      galleryEl.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        { clickToClose: true }
      );
      return;
    }
    galleryEl.innerHTML = '';
    createMarkup(response.data.hits);
    Notiflix.Notify.info(
      `Hooray! We found ${response.data.totalHits} images.`,
      { clickToClose: true }
    );
    totalPage = response.data.totalHits / perPage;
    simpleLightbox.refresh();

    if (!(response.data.totalHits <= 40)) {
      btnLoad.classList.remove('is-hidden');
      btnLoad.addEventListener('click', onLoadMoreBtnClick);
    }
  } catch (error) {
    console.log(error);
  }
}

async function searchImages(query, page) {
  return axios.get(
    `https://pixabay.com/api/?key=36997723-38cf838e5402e932e17b1b6e6&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`
  );
}

function createMarkup(gallery) {
  const markup = gallery
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
          <li class="photo-card">
<a class='gallery-link link' href='${largeImageURL}'>
<img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</a>
  
</li>`;
      }
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

async function onLoadMoreBtnClick() {
  page += 1;
  try {
    const response = await searchImages(query, page);
    createMarkup(response.data.hits);
    simpleLightbox.refresh();
    if (totalPage < page) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results.",
        { clickToClose: true }
      );
      btnLoad.classList.add('is-hidden');
      btnLoad.removeEventListener('click', onLoadMoreBtnClick);
    }
  } catch (error) {
    console.log(error);
  }
}

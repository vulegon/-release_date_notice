const getRequestURL = (searchText) => {
  const parameters = {
    applicationId: "1042532133891775191",
    formatVersion: 2,
    title: encodeURI(searchText),
    booksGenreId: "001", // カテゴリ: 001は本
    hits: 5, // 最大取得件数: 1〜30
    page: 1, // 取得ページ: 1〜
    outOfStockFlag: 1, // 0: 品切れや販売終了も表示しない 1: 表示させる
    sort: encodeURI("-releaseDate"),
  };
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&title=${parameters.title}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
  return url;
};

const rsGetRequestURL = () => {
    var parameters = {
      applicationId: "1042532133891775191",
      formatVersion: 2,
      size: 9,
      booksGenreId: "001", // カテゴリ: 001は本
      hits: 30, // 最大取得件数: 1〜30
      page: 1, // 取得ページ: 1〜
      outOfStockFlag: 1, // 0: 品切れや販売終了も表示しない 1: 表示させる
      sort: encodeURI("-releaseDate"),
    };
    var url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
    return url;
};

const featuredGetRequestURL = () => {
const parameters = {
  applicationId: "1042532133891775191",
  formatVersion: 2,
  size: 9,
  booksGenreId: "001", // カテゴリ: 001は本
  hits: 30, // 最大取得件数: 1〜30
  page: 1, // 取得ページ: 1〜
  outOfStockFlag: 0, // 0: 品切れや販売終了も表示しない 1: 表示させる
  sort: encodeURI("sales"),
};
 const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
return url;
};


new Vue({
  el: "#app",
  data: {
    searchText: "",
    rs_books: [], //release_scheduled_books,近日発売予定の本
    featured_books: [],//注目のアイテム
  },
  created() {
    var rs_url = rsGetRequestURL();
    fetch(rs_url).then((response) => response.json()).then((data) => {
      console.log(data.Items);
      this.rs_books = data.Items.map((items) => ({
        title: items.title,
        author: items.author,
        salesdate: items.salesDate,
        image: items.largeImageUrl,
        price: items.itemPrice,
        url: items.itemUrl
      }));
    });
    var featured_url = featuredGetRequestURL();
    fetch(featured_url).then((response) => response.json()).then((data) => {
    console.log(data.Items);
    this.featured_books = data.Items.map((items) => ({
      title: items.title,
      author: items.author,
      salesdate: items.salesDate,
      image: items.largeImageUrl,
      price: items.itemPrice,
      url: items.itemUrl
    }));
  });
      
  },
  methods: {
    fetchSearchBooks() {
      const url = getRequestURL(this.searchText);
      fetch(url).then((response) => response.json()).then((data) => {
        console.log(data.Items);
        this.books = data.Items.map((items) => ({
          title: items.title,
          author: items.author,
          salesdate: items.salesDate,
          image: items.largeImageUrl,
          price: items.itemPrice,
        }));
      });
    },
  }
});

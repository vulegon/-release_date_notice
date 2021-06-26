 var firebaseConfig = {
  apiKey: "AIzaSyD1hO8vMUKV_8gzTsgHz6hwmPGFYWxWtJ8",
  authDomain: "portfolio-favoritebook.firebaseapp.com",
  projectId: "portfolio-favoritebook",
  storageBucket: "portfolio-favoritebook.appspot.com",
  messagingSenderId: "1037889031239",
  appId: "1:1037889031239:web:e82761d0989623ff9a3562",
  measurementId: "G-Y9BDCHC1NC"
 };
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
 const db = firebase.firestore();
 const collection = db.collection('favorite_book');

 const getRequestURL = (page, searchText) => {
  const parameters = {
   applicationId: "1042532133891775191",
   formatVersion: 2,
   size: 9,
   title: encodeURI(searchText),
   booksGenreId: "001", // カテゴリ: 001は本
   hits: 30, // 最大取得件数: 1〜30
   page: page, // 取得ページ: 1〜
   outOfStockFlag: 1, // 0: 品切れや販売終了も表示しない 1: 表示させる
   sort: encodeURI("-releaseDate"),
  };
  const url = `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${parameters.applicationId}&formatVersion=${parameters.formatVersion}&size=${parameters.size}&title=${parameters.title}&booksGenreId=${parameters.booksGenreId}&hits=${parameters.hits}&page=${parameters.page}&outOfStockFlag=${parameters.outOfStockFlag}&sort=${parameters.sort}`;
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

 Vue.use(window.VueInfiniteLoading);


 new Vue({
  el: "#app",
  data: {
   searchText: "", //検索した文字
   search_books: [], //検索した本
   rs_books: [], //release_scheduled_books,近日発売予定の本
   featured_books: [], //注目のアイテム
   selectIndex: null,
   featured_selectIndex: null,
   selectFavorite: [],
   featured_selectFavorite: [],
   rsFlag: true, //初期状態。近日発売予定の本を表示するフラグ
   searchFlag: false, //検索したという状態を表すフラグ
   favorite_books: [],
   favorite_flag: false, //お気に入りにデータが有るかどうか
   favorite_listFlag: false, //お気に入り一覧を表示するためのフラグ
   searchPageCount: 2,
   infiniteId: 0,
  },
  created() {
   const rs_Promise = new Promise((resolve, reject) => {
    var rs_url = rsGetRequestURL();
    fetch(rs_url).then((response) => response.json()).then((data) => {
     this.rs_books = data.Items.map((items) => ({
      title: items.title,
      author: items.author,
      salesdate: items.salesDate,
      image: items.largeImageUrl,
      price: items.itemPrice,
      url: items.itemUrl,
      small_image: items.smallImageUrl,
      isbn: items.isbn,
      category: "rs_book",
     }));
    }).then(() => {
     resolve();
    });
   });

   const featured_Promise = new Promise((resolve, reject) => {
    var featured_url = featuredGetRequestURL();
    fetch(featured_url).then((response) => response.json()).then((data) => {
     this.featured_books = data.Items.map((items) => ({
      title: items.title,
      author: items.author,
      salesdate: items.salesDate,
      image: items.largeImageUrl,
      price: items.itemPrice,
      url: items.itemUrl,
      small_image: items.smallImageUrl,
      isbn: items.isbn,
      category: "featured_book",
     }));
    }).then(() => {
     resolve();
    });
   });
   const favorite_Promise = new Promise((resolve, reject) => {
    collection.get().then((querySnapshot) => {
     //Firebaseに保存されているデータを取り出す。
     querySnapshot.forEach((doc) => {
      if (doc.exists) {
       this.favorite_flag = true;
       this.favorite_books.push({
        title: doc.data().title,
        author: doc.data().author,
        salesdate: doc.data().salesdate,
        image: doc.data().image,
        price: doc.data().price,
        url: doc.data().url,
        small_image: doc.data().small_image,
        isbn: doc.data().isbn,
       });
      }
     });
    }).then(() => {
     resolve();
    });
   });
   Promise.all([rs_Promise, featured_Promise, favorite_Promise]).then(() => {
    this.favoriteButtonInit(this.rs_books);
    this.favoriteButtonInit(this.featured_books);
   });

  },
  methods: {
   fetchSearchBooks() {
    const url = getRequestURL(1, this.searchText);
    fetch(url).then((response) => response.json()).then((data) => {
     this.search_books = data.Items.map((items) => ({
      title: items.title,
      author: items.author,
      salesdate: items.salesDate,
      image: items.largeImageUrl,
      price: items.itemPrice,
      url: items.itemUrl,
      small_image: items.smallImageUrl,
      isbn: items.isbn,
      category: "search_book",
     }));
    }).then(() => {
     this.favoriteButtonInit(this.search_books);


     this.rsFlag = false;
     this.searchFlag = true;
     this.favorite_listFlag = false;
     //無限リロードの初期化。これをすることで2回目以降の無限リロードもできるようになる
     this.infiniteId++;
    });
   },
   favoriteButtonShow(index, book) {
    if (book.category === "featured_book") {
     this.featured_selectIndex = index;
    }
    else {
     this.selectIndex = index;
    }
   },
   favoriteButtonHidden(index, book) {
    if (book.category === "featured_book") {
     this.featured_selectIndex = null;
    }
    else {
     this.selectIndex = null;
    }
   },
   favoriteButtonClick(index, book) {

    //同じ本が既にお気に入りあるかどうかの判定。same_bookが1以上なら登録しない。
    var same_book = 0;
    for (let i = 0; i < this.favorite_books.length; i++) {
     if (this.favorite_books[i].isbn === book.isbn) {
      same_book = same_book + 1;
     }
    }
    if (same_book === 0) {
     if (book.category === "featured_book") {
      this.featured_selectFavorite[index] = index;
      console.log("お気に入り登録しました。featured_selectFavoriteの番号は:" + this.featured_selectFavorite);
     }
     else {
      this.selectFavorite[index] = index;
      console.log("お気に入り登録しました。selectFavoriteの番号は:" + this.selectFavorite);
     }
     this.favorite_books.push({
      title: book.title,
      author: book.author,
      salesdate: book.salesdate,
      image: book.image,
      price: book.price,
      url: book.url,
      small_image: book.small_image,
      isbn: book.isbn,
     });

     //Firebaseにデータを保存
     this.favorite_flag = true;
     collection.add({
      title: book.title,
      author: book.author,
      salesdate: book.salesdate,
      image: book.image,
      price: book.price,
      url: book.url,
      small_image: book.small_image,
      isbn: book.isbn,
     });
    }
    else if (same_book === 1) {
     alert("既に同じ本が登録されています。処理を中断します。");
    }
   },
   favoriteButtonDelete(index, book) {
    var book_id = book.isbn;
    this.favorite_books = this.favorite_books.filter((favorite_book) => {
     return (favorite_book.isbn !== book_id);
    });
    console.log("削除実行");
    for (let j = 0; j < this.rs_books.length; j++) {
     if (book_id === this.rs_books[j].isbn) {
      this.selectFavorite[j] = "";
     }
    }
    for (let j = 0; j < this.search_books.length; j++) {
     if (book_id === this.search_books[j].isbn) {
      this.selectFavorite[j] = "";
     }
    }
    for (let j = 0; j < this.featured_books.length; j++) {
     if (book_id === this.featured_books[j].isbn) {
      this.featured_selectFavorite[j] = "";
     }
    }

    collection.get().then((querySnapshot) => {
     querySnapshot.forEach((doc) => {
      if (doc.data().isbn === book_id) {
       collection.doc(doc.id).delete();
       console.log("削除しました");
      }
     });
    });
   },
   favoriteListShow() {
    this.rsFlag = false;
    this.searchFlag = false;
    this.favorite_listFlag = true;

    this.calc_salesdate();

   },
   homeWindowShow() {
    this.rsFlag = true;
    this.searchFlag = false;
    this.favorite_listFlag = false;
    this.favoriteButtonInit(this.rs_books);
    this.favoriteButtonInit(this.featured_books);
   },
   infiniteLoad($state) {
    var url = getRequestURL(this.searchPageCount, this.searchText);
    fetch(url).then((response) => response.json()).then((data) => {
     data.Items.forEach((items) => {
      this.search_books.push({
       title: items.title,
       author: items.author,
       salesdate: items.salesDate,
       image: items.largeImageUrl,
       price: items.itemPrice,
       url: items.itemUrl,
       small_image: items.smallImageUrl,
       isbn: items.isbn,
      });
     });
     if (this.searchPageCount <= 100 && data.Items.length !== 0) {
      this.searchPageCount++;
      $state.loaded();
     }
     else {
      $state.complete();
     }
    }).then(() => {
     this.favoriteButtonInit(this.search_books);
    });
   },
   favoriteButtonInit(books) {
    if (books[0].category === "featured_book") {
     this.featured_selectFavorite.length = 0;
     for (let i = 0; i < this.favorite_books.length; i++) {
      for (let j = 0; j < books.length; j++) {
       if (this.favorite_books[i].isbn === books[j].isbn) {
        this.featured_selectFavorite[j] = j;
       }
      }
     }
     this.featured_selectIndex = true;
    }
    else {
     this.selectFavorite.length = 0;
     for (let i = 0; i < this.favorite_books.length; i++) {
      for (let j = 0; j < books.length; j++) {
       if (this.favorite_books[i].isbn === books[j].isbn) {
        this.selectFavorite[j] = j;
       }
      }
     }
     this.selectIndex = true;
    }
   },
   calc_salesdate() {
    const today = new Date().getTime();
    var salesdateTime;
    var year, month, date, index;
    var remain_date;

 
    for (let i = 0; i < this.favorite_books.length; i++) {
     index = this.favorite_books[i].salesdate.indexOf("年");
     year = this.favorite_books[i].salesdate.substring(0, index);
     month = this.favorite_books[i].salesdate.substring(index + 1, this.favorite_books[i].salesdate.indexOf("月"));
     if (month.slice(0, 1) === "0") {
      month = month.slice(1, 2);
     }
     index = this.favorite_books[i].salesdate.indexOf("月");
     date = this.favorite_books[i].salesdate.substring(index + 1, this.favorite_books[i].salesdate.indexOf("日"));
     if (date.slice(0, 1) === "0") {
      date = date.slice(1, 2);
     }
     year = parseInt(year);
     month = parseInt(month);
     date = parseInt(date);
     
     salesdateTime = new Date(year,month-1,date).getTime();
     remain_date=Math.ceil((salesdateTime-today)/( 1000 * 60 * 60 * 24 ));
     
     if(remain_date<0){
      remain_date = "販売中";
     }else if(remain_date>365){
      remain_date="365日〜";
     }else{
      remain_date = "あと"+remain_date+"日";
     }
     this.favorite_books[i].ur_date=remain_date; // until release date
     console.log("発売日まで"+this.favorite_books[i].until_release_date);
    }
   },
  }
 });
 
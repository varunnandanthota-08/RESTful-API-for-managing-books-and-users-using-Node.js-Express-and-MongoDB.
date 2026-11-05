const bcrypt = require('bcryptjs');
const Book = require('../models/book');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Cart = require('../models/cart');

const sampleBooks = [
    // 1. Fiction
    
        {
    
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        price: 14.99,
        year: 1925,
        stock: 25,
        isbn: '978-0743273565',
        description: 'The story of the mysteriously wealthy Jay Gatsby and his unrequited love for Daisy Buchanan amidst the roaring twenties in Long Island.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
        rating: 4.6,
        reviewsCount: 18,
        isFeatured: true
    },
    
        {
    
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        price: 13.49,
        year: 1960,
        stock: 20,
        isbn: '978-0061120084',
        description: 'The unforgettable novel of childhood innocence and racial injustice in a sleepy Southern town as lawyer Atticus Finch defends an innocent man.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
        rating: 4.9,
        reviewsCount: 55,
        isFeatured: false
    },
    
        {
    
        title: '1984',
        author: 'George Orwell',
        category: 'Fiction',
        price: 12.99,
        year: 1949,
        stock: 18,
        isbn: '978-0451524935',
        description: 'A chilling dystopian masterpiece exploring total surveillance, thought control, totalitarian power, and Winston Smith’s rebellion against Big Brother.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
        rating: 4.8,
        reviewsCount: 62,
        isFeatured: true
    },
    
        {
    
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        category: 'Fiction',
        price: 11.50,
        year: 1813,
        stock: 15,
        isbn: '978-0141439518',
        description: 'A witty romantic classic tracing the emotional development of Elizabeth Bennet as she navigates manners, upbringing, and her stormy dynamic with Mr. Darcy.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
        rating: 4.7,
        reviewsCount: 39,
        isFeatured: false
    },
    
        {
    
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        category: 'Fiction',
        price: 15.20,
        year: 1951,
        stock: 12,
        isbn: '978-0316769488',
        description: 'Holden Caulfield recounts his wanderings across New York City following his expulsion from prep school, exploring youthful alienation and identity.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg',
        rating: 4.2,
        reviewsCount: 28,
        isFeatured: false
    },

    // 2. Science Fiction
    
        {
    
        title: 'Dune',
        author: 'Frank Herbert',
        category: 'Science Fiction',
        price: 16.99,
        year: 1965,
        stock: 22,
        isbn: '978-0441172719',
        description: 'Set on the harsh desert planet Arrakis, Dune follows Paul Atreides as noble houses war over control of the universe’s most precious substance: spice.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
        rating: 4.7,
        reviewsCount: 45,
        isFeatured: true
    },
    
        {
    
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        category: 'Science Fiction',
        price: 21.00,
        year: 2021,
        stock: 14,
        isbn: '978-0593135204',
        description: 'Ryland Grace is the lone survivor on an interstellar mission to save humanity from solar extinction, armed only with science and an unexpected extraterrestrial ally.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg',
        rating: 4.9,
        reviewsCount: 68,
        isFeatured: true
    },
    
        {
    
        title: 'Neuromancer',
        author: 'William Gibson',
        category: 'Science Fiction',
        price: 14.50,
        year: 1984,
        stock: 10,
        isbn: '978-0441569595',
        description: 'The definitive cyberpunk classic following washed-up console cowboy Case as he is hired for an impossible digital heist into an all-powerful corporate AI.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg',
        rating: 4.5,
        reviewsCount: 31,
        isFeatured: false
    },
    
        {
    
        title: 'The Three-Body Problem',
        author: 'Cixin Liu',
        category: 'Science Fiction',
        price: 17.95,
        year: 2008,
        stock: 16,
        isbn: '978-0765382030',
        description: 'Set against China’s Cultural Revolution, an astrophysicist sends a signal into deep space with monumental cosmic repercussions for the fate of civilization.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780765382030-L.jpg',
        rating: 4.6,
        reviewsCount: 40,
        isFeatured: false
    },
    
        {
    
        title: 'Foundation',
        author: 'Isaac Asimov',
        category: 'Science Fiction',
        price: 15.00,
        year: 1951,
        stock: 9,
        isbn: '978-0553293357',
        description: 'Hari Seldon uses psychohistory to predict the imminent fall of the Galactic Empire and creates the Foundation to preserve human knowledge through the dark ages.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg',
        rating: 4.7,
        reviewsCount: 33,
        isFeatured: false
    },

    // 3. Mystery
    
        {
    
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        category: 'Mystery',
        price: 15.99,
        year: 2019,
        stock: 12,
        isbn: '978-1250301696',
        description: 'Alicia Berenson shoots her husband five times and never speaks again. A determined forensic psychotherapist risks his career to unlock her hidden truth.',
        coverImage: 'https://covers.openlibrary.org/b/id/9407338-L.jpg',
        rating: 4.5,
        reviewsCount: 29,
        isFeatured: true
    },
    
        {
    
        title: 'Gone Girl',
        author: 'Gillian Flynn',
        category: 'Mystery',
        price: 14.99,
        year: 2012,
        stock: 11,
        isbn: '978-0307588371',
        description: 'When Amy Dunne disappears on her fifth wedding anniversary, suspicion immediately falls on her husband Nick in this razor-sharp psychological thriller.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg',
        rating: 4.4,
        reviewsCount: 37,
        isFeatured: false
    },
    
        {
    
        title: 'And Then There Were None',
        author: 'Agatha Christie',
        category: 'Mystery',
        price: 12.99,
        year: 1939,
        stock: 19,
        isbn: '978-0062073488',
        description: 'Ten strangers are lured to an isolated island mansion off the Devon coast. One by one, they are murdered in accordance with a sinister nursery rhyme.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780062073488-L.jpg',
        rating: 4.8,
        reviewsCount: 52,
        isFeatured: false
    },
    
        {
    
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        category: 'Mystery',
        price: 16.50,
        year: 2005,
        stock: 8,
        isbn: '978-0307949486',
        description: 'Disgraced journalist Mikael Blomkvist and brilliant hacker Lisbeth Salander uncover a dark web of family secrets while investigating a decades-old disappearance.',
        coverImage: 'https://covers.openlibrary.org/b/id/10567897-L.jpg',
        rating: 4.6,
        reviewsCount: 34,
        isFeatured: false
    },

    // 4. Technology
    
        {
    
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Technology',
        price: 38.50,
        year: 2008,
        stock: 14,
        isbn: '978-0132350884',
        description: 'Essential wisdom for software engineers detailing principles, patterns, and refactoring practices for producing maintainable, readable code.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
        rating: 4.8,
        reviewsCount: 42,
        isFeatured: true
    },
    
        {
    
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        category: 'Technology',
        price: 45.00,
        year: 2017,
        stock: 20,
        isbn: '978-1449373320',
        description: 'The definitive architectural guide to distributed data systems, scalability, consistency, transactions, replication, and fault tolerance.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg',
        rating: 4.9,
        reviewsCount: 85,
        isFeatured: true
    },
    
        {
    
        title: 'The Pragmatic Programmer: 20th Anniversary Edition',
        author: 'David Thomas & Andrew Hunt',
        category: 'Technology',
        price: 42.00,
        year: 2019,
        stock: 15,
        isbn: '978-0135957059',
        description: 'Timeless career lessons covering software craft, developer mindset, automation, testing, and continuous learning for modern engineers.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
        rating: 4.9,
        reviewsCount: 60,
        isFeatured: true
    },
    
        {
    
        title: 'Refactoring: Improving the Design of Existing Code',
        author: 'Martin Fowler',
        category: 'Technology',
        price: 44.95,
        year: 2018,
        stock: 10,
        isbn: '978-0134757599',
        description: 'Step-by-step catalog of refactorings explaining how to systematically transform messy legacy code into clean, modular, and maintainable systems.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780134757599-L.jpg',
        rating: 4.7,
        reviewsCount: 29,
        isFeatured: false
    },

    // 5. Programming
    
        {
    
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        category: 'Programming',
        price: 29.99,
        year: 2008,
        stock: 12,
        isbn: '978-0596517748',
        description: 'An authoritative classic uncovering the elegant, expressive, and highly functional subset of JavaScript that makes it a formidable language.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg',
        rating: 4.4,
        reviewsCount: 22,
        isFeatured: false
    },
    
        {
    
        title: 'Eloquent JavaScript: A Modern Introduction',
        author: 'Marijn Haverbeke',
        category: 'Programming',
        price: 32.50,
        year: 2018,
        stock: 18,
        isbn: '978-1593279509',
        description: 'A deep immersion into JavaScript programming covering syntax, functional techniques, asynchronous execution, and building full web applications.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781593279509-L.jpg',
        rating: 4.7,
        reviewsCount: 48,
        isFeatured: true
    },
    
        {
    
        title: 'Python Crash Course: A Hands-On Project-Based Intro',
        author: 'Eric Matthes',
        category: 'Programming',
        price: 34.99,
        year: 2019,
        stock: 24,
        isbn: '978-1593279288',
        description: 'The world’s bestselling guide to Python programming, teaching fundamentals through engaging hands-on projects including games, data visualizations, and web apps.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg',
        rating: 4.8,
        reviewsCount: 71,
        isFeatured: true
    },
    
        {
    
        title: 'Rust in Action: Systems Programming with Rust',
        author: 'Tim McNamara',
        category: 'Programming',
        price: 49.99,
        year: 2021,
        stock: 8,
        isbn: '978-1617294556',
        description: 'Practical, systems-level exploration of memory safety, concurrency, operating system primitives, and network protocols using Rust.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781617294556-L.jpg',
        rating: 4.8,
        reviewsCount: 30,
        isFeatured: false
    },
    
        {
    
        title: 'Learning React: Modern Patterns for Developing React Apps',
        author: 'Alex Banks & Eve Porcello',
        category: 'Programming',
        price: 39.00,
        year: 2020,
        stock: 14,
        isbn: '978-1492051725',
        description: 'Clear walkthrough of modern React concepts including hooks, state management, component lifecycles, routing, and component architecture.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781492051725-L.jpg',
        rating: 4.6,
        reviewsCount: 26,
        isFeatured: false
    },

    // 6. Artificial Intelligence
    
        {
    
        title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
        author: 'Stuart Russell & Peter Norvig',
        category: 'Artificial Intelligence',
        price: 79.99,
        year: 2020,
        stock: 12,
        isbn: '978-0134610993',
        description: 'The comprehensive global gold-standard textbook on intelligent agents, machine learning, probabilistic reasoning, robotics, and deep neural networks.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg',
        rating: 4.9,
        reviewsCount: 54,
        isFeatured: true
    },
    
        {
    
        title: 'Deep Learning',
        author: 'Ian Goodfellow, Yoshua Bengio & Aaron Courville',
        category: 'Artificial Intelligence',
        price: 68.00,
        year: 2016,
        stock: 10,
        isbn: '978-0262035613',
        description: 'An authoritative mathematical and conceptual treatise on deep neural networks, backpropagation, convolutional networks, and generative modeling.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780262035613-L.jpg',
        rating: 4.7,
        reviewsCount: 41,
        isFeatured: false
    },
    
        {
    
        title: 'Life 3.0: Being Human in the Age of Artificial Intelligence',
        author: 'Max Tegmark',
        category: 'Artificial Intelligence',
        price: 18.50,
        year: 2017,
        stock: 20,
        isbn: '978-1101946596',
        description: 'MIT physicist Max Tegmark explores the profound societal, economic, philosophical, and existential consequences of superintelligent machines.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781101946596-L.jpg',
        rating: 4.6,
        reviewsCount: 38,
        isFeatured: false
    },
    
        {
    
        title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
        author: 'Aurélien Géron',
        category: 'Artificial Intelligence',
        price: 54.99,
        year: 2022,
        stock: 15,
        isbn: '978-1098125974',
        description: 'A concrete, code-first blueprint for training deep models, computer vision systems, and transformers using industry-standard Python libraries.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781098125974-L.jpg',
        rating: 4.9,
        reviewsCount: 77,
        isFeatured: true
    },

    // 7. Data Science
    
        {
    
        title: 'Python for Data Analysis: Data Wrangling with pandas & NumPy',
        author: 'Wes McKinney',
        category: 'Data Science',
        price: 43.50,
        year: 2022,
        stock: 16,
        isbn: '978-1098104030',
        description: 'Written by the creator of pandas, this hands-on guide teaches practical manipulation, cleaning, aggregation, and visualization of tabular data.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781098104030-L.jpg',
        rating: 4.8,
        reviewsCount: 49,
        isFeatured: true
    },
    
        {
    
        title: 'Storytelling with Data: A Data Visualization Guide',
        author: 'Cole Nussbaumer Knaflic',
        category: 'Data Science',
        price: 36.00,
        year: 2015,
        stock: 22,
        isbn: '978-1119002253',
        description: 'Master the art of visual communication and narrative construction to turn raw charts into persuasive business impact.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781119002253-L.jpg',
        rating: 4.8,
        reviewsCount: 52,
        isFeatured: false
    },
    
        {
    
        title: 'Practical Statistics for Data Scientists: 50+ Essential Concepts',
        author: 'Peter Bruce & Andrew Bruce',
        category: 'Data Science',
        price: 39.95,
        year: 2020,
        stock: 12,
        isbn: '978-1492072942',
        description: 'Clear explanations of exploratory data analysis, sampling distributions, hypothesis testing, regression, and classification using R and Python.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781492072942-L.jpg',
        rating: 4.6,
        reviewsCount: 31,
        isFeatured: false
    },
    
        {
    
        title: 'The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling',
        author: 'Ralph Kimball & Margy Ross',
        category: 'Data Science',
        price: 52.00,
        year: 2013,
        stock: 7,
        isbn: '978-1118530801',
        description: 'The industry-standard bible for star schemas, enterprise data architectures, ETL pipelines, and analytical data marts.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781118530801-L.jpg',
        rating: 4.7,
        reviewsCount: 23,
        isFeatured: false
    },

    // 8. Business
    
        {
    
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        author: 'Peter Thiel with Blake Masters',
        category: 'Business',
        price: 18.00,
        year: 2014,
        stock: 25,
        isbn: '978-0804139298',
        description: 'Legendary entrepreneur Peter Thiel presents contrarian principles on creating proprietary monopolies, vertical progress, and unique innovation.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg',
        rating: 4.6,
        reviewsCount: 65,
        isFeatured: true
    },
    
        {
    
        title: 'The Lean Startup: How Today’s Entrepreneurs Use Continuous Innovation',
        author: 'Eric Ries',
        category: 'Business',
        price: 19.50,
        year: 2011,
        stock: 19,
        isbn: '978-0307887894',
        description: 'The groundbreaking methodology that transformed tech entrepreneurship through Minimum Viable Products, validated learning, and rapid iteration.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
        rating: 4.5,
        reviewsCount: 47,
        isFeatured: false
    },
    
        {
    
        title: 'Good to Great: Why Some Companies Make the Leap and Others Don’t',
        author: 'Jim Collins',
        category: 'Business',
        price: 22.00,
        year: 2001,
        stock: 15,
        isbn: '978-0066620992',
        description: 'Rigorous empirical research revealing why certain organizations achieve enduring market leadership through Level 5 leadership and the Flywheel effect.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg',
        rating: 4.7,
        reviewsCount: 39,
        isFeatured: false
    },
    
        {
    
        title: 'Shoe Dog: A Memoir by the Creator of Nike',
        author: 'Phil Knight',
        category: 'Business',
        price: 17.50,
        year: 2016,
        stock: 21,
        isbn: '978-1501135927',
        description: 'An intimate, candid memoir detailing Phil Knight’s tumultuous journey building Nike from a humble boot-of-car distributor into an athletic icon.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781501135927-L.jpg',
        rating: 4.9,
        reviewsCount: 82,
        isFeatured: true
    },

    // 9. Self Improvement
    
        {
    
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self Improvement',
        price: 18.20,
        year: 2018,
        stock: 35,
        isbn: '978-0735211292',
        description: 'An acclaimed framework for daily compounding improvement through cue-craving-response-reward habit loops and identity-based shifts.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        rating: 4.9,
        reviewsCount: 94,
        isFeatured: true
    },
    
        {
    
        title: 'Deep Work: Rules for Focused Success in a Distracted World',
        author: 'Cal Newport',
        category: 'Self Improvement',
        price: 17.00,
        year: 2016,
        stock: 18,
        isbn: '978-1455586691',
        description: 'Georgetown professor Cal Newport argues that the ability to focus without distraction is rapidly becoming one of the most valuable capabilities in the global economy.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
        rating: 4.7,
        reviewsCount: 51,
        isFeatured: true
    },
    
        {
    
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        category: 'Self Improvement',
        price: 19.99,
        year: 2011,
        stock: 14,
        isbn: '978-0374533557',
        description: 'Nobel laureate Daniel Kahneman explains the two cognitive engines shaping judgment: the fast intuitive System 1 and the slow deliberative System 2.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
        rating: 4.6,
        reviewsCount: 38,
        isFeatured: false
    },
    
        {
    
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        category: 'Self Improvement',
        price: 16.99,
        year: 1989,
        stock: 20,
        isbn: '978-1982137274',
        description: 'A holistic principle-centered approach for personal and professional effectiveness emphasizing proactive responsibility, synergy, and win-win relationships.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg',
        rating: 4.7,
        reviewsCount: 43,
        isFeatured: false
    },

    // 10. History
    
        {
    
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        price: 22.50,
        year: 2014,
        stock: 28,
        isbn: '978-0062316097',
        description: 'A sweeping narrative detailing how an insignificant ape on the African savanna conquered the planet through shared fictions, empire, and science.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
        rating: 4.8,
        reviewsCount: 88,
        isFeatured: true
    },
    
        {
    
        title: 'Guns, Germs, and Steel: The Fates of Human Societies',
        author: 'Jared Diamond',
        category: 'History',
        price: 19.00,
        year: 1997,
        stock: 12,
        isbn: '978-0393354324',
        description: 'Pulitzer Prize winner assessing how geographic and environmental conditions dictated the divergent development of civilizations over 13,000 years.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780393354324-L.jpg',
        rating: 4.5,
        reviewsCount: 36,
        isFeatured: false
    },
    
        {
    
        title: 'The Silk Roads: A New History of the World',
        author: 'Peter Frankopan',
        category: 'History',
        price: 20.00,
        year: 2015,
        stock: 15,
        isbn: '978-1101912379',
        description: 'A brilliant re-examination of global history illuminating the Central Asian trade routes where religions, empires, and technologies first intermingled.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781101912379-L.jpg',
        rating: 4.7,
        reviewsCount: 29,
        isFeatured: false
    },
    
        {
    
        title: 'SPQR: A History of Ancient Rome',
        author: 'Mary Beard',
        category: 'History',
        price: 18.50,
        year: 2015,
        stock: 11,
        isbn: '978-1631492228',
        description: 'Cambridge classicist Mary Beard explores how an unremarkable muddy village transformed into a sprawling superpower ruling across three continents.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781631492228-L.jpg',
        rating: 4.6,
        reviewsCount: 27,
        isFeatured: false
    },

    // 11. Biography
    
        {
    
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        category: 'Biography',
        price: 24.00,
        year: 2011,
        stock: 22,
        isbn: '978-1451648539',
        description: 'The definitive bestselling biography of the iconic Apple visionary whose passion for perfection and ferocity revolutionized six major industries.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781451648539-L.jpg',
        rating: 4.8,
        reviewsCount: 75,
        isFeatured: true
    },
    
        {
    
        title: 'Elon Musk',
        author: 'Walter Isaacson',
        category: 'Biography',
        price: 26.50,
        year: 2023,
        stock: 17,
        isbn: '978-1982181284',
        description: 'An astonishingly intimate portrait of the polarizing genius behind SpaceX, Tesla, Neuralink, and the daring push to colonize Mars.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781982181284-L.jpg',
        rating: 4.6,
        reviewsCount: 46,
        isFeatured: true
    },
    
        {
    
        title: 'Becoming',
        author: 'Michelle Obama',
        category: 'Biography',
        price: 21.00,
        year: 2018,
        stock: 26,
        isbn: '978-1524763138',
        description: 'An inspiring and deeply reflective memoir chronicling Michelle Obama’s roots on Chicago’s South Side through her historic tenure in the White House.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg',
        rating: 4.9,
        reviewsCount: 89,
        isFeatured: false
    },
    
        {
    
        title: 'Leonardo da Vinci',
        author: 'Walter Isaacson',
        category: 'Biography',
        price: 23.50,
        year: 2017,
        stock: 9,
        isbn: '978-1501139154',
        description: 'A magnificent study of history’s greatest renaissance mind, intertwining Leonardo’s notebook sketches, artistic triumphs, and scientific explorations.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9781501139154-L.jpg',
        rating: 4.7,
        reviewsCount: 33,
        isFeatured: false
    },

    // 12. Fantasy
    
        {
    
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        category: 'Fantasy',
        price: 17.50,
        year: 1937,
        stock: 25,
        isbn: '978-0547928227',
        description: 'Bilbo Baggins leaves his cozy hole under the Hill to join Gandalf the wizard and thirteen dwarves on a perilous quest to reclaim the Lonely Mountain.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
        rating: 4.8,
        reviewsCount: 58,
        isFeatured: true
    },
    
        {
    
        title: 'The Name of the Wind',
        author: 'Patrick Rothfuss',
        category: 'Fantasy',
        price: 18.99,
        year: 2007,
        stock: 14,
        isbn: '978-0756404741',
        description: 'Kvothe recounts the true history of his life: from an orphaned boy in a troupe of traveling performers to a legendary wizard, thief, and kingkiller.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg',
        rating: 4.8,
        reviewsCount: 64,
        isFeatured: true
    },
    
        {
    
        title: 'A Game of Thrones: A Song of Ice and Fire',
        author: 'George R.R. Martin',
        category: 'Fantasy',
        price: 19.99,
        year: 1996,
        stock: 20,
        isbn: '978-0553103540',
        description: 'Summers span decades and winter can last a lifetime as noble houses vie for the Iron Throne amidst ancient supernatural threats brewing beyond the Wall.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780553103540-L.jpg',
        rating: 4.7,
        reviewsCount: 72,
        isFeatured: false
    },
    
        {
    
        title: 'The Way of Kings: The Stormlight Archive',
        author: 'Brandon Sanderson',
        category: 'Fantasy',
        price: 22.00,
        year: 2010,
        stock: 16,
        isbn: '978-0765326355',
        description: 'On Roshar, a world of tempestuous highstorms and shattered plains, a disgraced highborn slave discovers an ancient legacy capable of saving mankind.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg',
        rating: 4.9,
        reviewsCount: 83,
        isFeatured: true
    },
    
        {
    
        title: 'The Fellowship of the Ring',
        author: 'J.R.R. Tolkien',
        category: 'Fantasy',
        price: 16.50,
        year: 1954,
        stock: 0, // Intentionally 0 for out-of-stock badge test
        isbn: '978-0547928210',
        description: 'Frodo Baggins receives the One Ring forged by the Dark Lord Sauron and embarks on a desperate fellowship to cast it into the fires of Mount Doom.',
        coverImage: 'https://covers.openlibrary.org/b/isbn/9780547928210-L.jpg',
        rating: 4.9,
        reviewsCount: 91,
        isFeatured: false
    }
];

const sampleCustomers = [
    { name: 'Jane Customer', email: 'customer@bookstore.com', phone: '+1 (555) 749-1029', street: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', zipCode: '97477' },
    { name: 'Alexander Hamilton', email: 'alexander@example.com', phone: '+1 (555) 234-5678', street: '57 Wall Street', city: 'New York', state: 'NY', zipCode: '10005' },
    { name: 'Eleanor Vance', email: 'eleanor@example.com', phone: '+1 (555) 345-6789', street: '12 Hill House Lane', city: 'Boston', state: 'MA', zipCode: '02108' },
    { name: 'Marcus Aurelius', email: 'marcus@example.com', phone: '+1 (555) 456-7890', street: '1 Palatine Hill Way', city: 'Rome', state: 'GA', zipCode: '30161' },
    { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+1 (555) 567-8901', street: '1843 Babbage Circle', city: 'London', state: 'OH', zipCode: '43140' },
    { name: 'Arthur Conan Doyle', email: 'arthur@example.com', phone: '+1 (555) 678-9012', street: '221B Baker Street', city: 'Baker', state: 'CA', zipCode: '92309' },
    { name: 'Grace Hopper', email: 'grace@example.com', phone: '+1 (555) 789-0123', street: '1947 Compiler Way', city: 'Arlington', state: 'VA', zipCode: '22202' },
    { name: 'Alan Turing', email: 'alan@example.com', phone: '+1 (555) 890-1234', street: '1912 Enigma Avenue', city: 'Princeton', state: 'NJ', zipCode: '08544' },
    { name: 'Marie Curie', email: 'marie@example.com', phone: '+1 (555) 901-2345', street: '1898 Radium Boulevard', city: 'Paris', state: 'TX', zipCode: '75460' },
    { name: 'Nikola Tesla', email: 'nikola@example.com', phone: '+1 (555) 012-3456', street: '1856 Alternating Current Dr', city: 'Colorado Springs', state: 'CO', zipCode: '80903' },
    { name: 'Virginia Woolf', email: 'virginia@example.com', phone: '+1 (555) 123-4560', street: '1929 Room of One’s Own Rd', city: 'Richmond', state: 'VA', zipCode: '23219' }
];

const sampleReviewComments = [
    "One of the finest books I've read in years. Captivating from the opening paragraph.",
    "Remarkably well-researched and brilliantly structured. Couldn't put it down!",
    "A foundational piece of literature that completely changed my perspective.",
    "Engaging, thought-provoking, and deeply insightful. Highly recommended.",
    "A masterpiece of prose and narrative pacing. Deserves every bit of acclaim.",
    "A must-read for anyone interested in this subject. Practical, lucid, and profound."
];

const seedDatabase = async () => {
    try {
        console.log('--- Initializing Database Seeder ---');

        // 1. Seed Administrator and Customers
        const adminPassword = await bcrypt.hash('admin123', 10);
        const customerPassword = await bcrypt.hash('customer123', 10);

        // Ensure Admin exists
        let adminUser = await User.findOne({ email: 'admin@bookstore.com' });
        if (!adminUser) {
            adminUser = await User.create({
                name: 'Store Administrator',
                email: 'admin@bookstore.com',
                password: adminPassword,
                role: 'admin',
                phone: '+1 (555) 019-2834',
                address: {
                    street: '100 Tech Plaza, Suite 400',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'USA'
                }
            });
            console.log('Seeded Admin account: admin@bookstore.com (admin123)');
        }

        // Ensure Sample Customers exist
        const customerDocs = [];
        for (const cust of sampleCustomers) {
            let user = await User.findOne({ email: cust.email });
            if (!user) {
                user = await User.create({
                    name: cust.name,
                    email: cust.email,
                    password: customerPassword,
                    role: 'customer',
                    phone: cust.phone,
                    address: {
                        street: cust.street,
                        city: cust.city,
                        state: cust.state,
                        zipCode: cust.zipCode,
                        country: 'USA'
                    }
                });
            }
            customerDocs.push(user);
        }
        console.log(`Seeded/verified ${customerDocs.length} customer accounts.`);

        // 2. Seed Books (Idempotent: upsert by title)
        let insertedBooksCount = 0;
        const seededBooks = [];

        for (const bookData of sampleBooks) {
            let book = await Book.findOne({ title: bookData.title });
            if (!book) {
                book = await Book.create(bookData);
                insertedBooksCount++;
            } else {
                await Book.updateOne({ _id: book._id }, { coverImage: bookData.coverImage });
            }
            seededBooks.push(book);
        }
        console.log(`Seeded/verified ${seededBooks.length} book titles (${insertedBooksCount} newly created).`);

        // 3. Seed Reviews for diverse books from different customers
        const existingReviewsCount = await Review.countDocuments();
        if (existingReviewsCount < 20 && seededBooks.length > 0 && customerDocs.length > 0) {
            console.log('Seeding customer book reviews...');
            for (let i = 0; i < Math.min(25, seededBooks.length); i++) {
                const book = seededBooks[i];
                const cust = customerDocs[i % customerDocs.length];
                const comment = sampleReviewComments[i % sampleReviewComments.length];
                const rating = 4 + (i % 2 === 0 ? 1 : 0);

                const existingReview = await Review.findOne({ book: book._id, user: cust._id });
                if (!existingReview) {
                    await Review.create({
                        book: book._id,
                        user: cust._id,
                        userName: cust.name,
                        rating,
                        comment,
                        createdAt: new Date(Date.now() - (i * 3600000 * 24))
                    });
                }
            }
            console.log('Customer reviews successfully seeded.');
        }

        // 4. Seed Orders across various statuses (Pending, Processing, Shipped, Delivered, Cancelled)
        const existingOrdersCount = await Order.countDocuments();
        if (existingOrdersCount < 15 && seededBooks.length > 5 && customerDocs.length > 0) {
            console.log('Seeding realistic customer orders...');
            const statuses = ['Delivered', 'Delivered', 'Shipped', 'Shipped', 'Processing', 'Processing', 'Pending', 'Cancelled'];
            const paymentMethods = ['credit_card', 'upi', 'credit_card', 'cod', 'net_banking'];

            for (let i = 1; i <= 18; i++) {
                const cust = customerDocs[i % customerDocs.length];
                const b1 = seededBooks[i % seededBooks.length];
                const b2 = seededBooks[(i + 3) % seededBooks.length];
                const orderStatus = statuses[i % statuses.length];
                const paymentMethod = paymentMethods[i % paymentMethods.length];

                const items = [
                    {
                        book: b1._id,
                        title: b1.title,
                        author: b1.author,
                        coverImage: b1.coverImage,
                        price: b1.price,
                        quantity: 1
                    }
                ];

                if (i % 2 === 0) {
                    items.push({
                        book: b2._id,
                        title: b2.title,
                        author: b2.author,
                        coverImage: b2.coverImage,
                        price: b2.price,
                        quantity: 2
                    });
                }

                const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
                const tax = parseFloat((subtotal * 0.08).toFixed(2));
                const shippingFee = subtotal > 50 ? 0 : 4.99;
                const totalAmount = parseFloat((subtotal + tax + shippingFee).toFixed(2));

                const orderId = `ORD-${100000 + i * 492}`;
                const existingOrder = await Order.findOne({ orderId });

                if (!existingOrder) {
                    await Order.create({
                        orderId,
                        user: cust._id,
                        items,
                        shippingAddress: {
                            fullName: cust.name,
                            phone: cust.phone,
                            street: cust.address.street,
                            city: cust.address.city,
                            state: cust.address.state,
                            zipCode: cust.address.zipCode,
                            country: 'USA'
                        },
                        paymentMethod,
                        paymentStatus: orderStatus === 'Cancelled' ? 'pending' : (paymentMethod === 'cod' && orderStatus !== 'Delivered' ? 'pending' : 'paid'),
                        orderStatus,
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        tax,
                        shippingFee,
                        totalAmount,
                        createdAt: new Date(Date.now() - (i * 3600000 * 36)) // Staggered over recent weeks
                    });
                }
            }
            console.log('Seeded 18 realistic sample orders with multiple delivery statuses.');
        }

        // 5. Seed Wishlist and Cart for default customer
        const defaultCustomer = customerDocs[0];
        if (defaultCustomer && seededBooks.length > 5) {
            // Wishlist
            if (!defaultCustomer.wishlist || defaultCustomer.wishlist.length === 0) {
                defaultCustomer.wishlist = [seededBooks[0]._id, seededBooks[2]._id, seededBooks[5]._id];
                await defaultCustomer.save();
                console.log('Seeded wishlist items for demo customer.');
            }

            // Cart
            const existingCart = await Cart.findOne({ user: defaultCustomer._id });
            if (!existingCart || existingCart.items.length === 0) {
                await Cart.findOneAndUpdate(
                    { user: defaultCustomer._id },
                    {
                        items: [
                            { book: seededBooks[1]._id, quantity: 1, price: seededBooks[1].price },
                            { book: seededBooks[3]._id, quantity: 2, price: seededBooks[3].price }
                        ],
                        updatedAt: Date.now()
                    },
                    { upsert: true }
                );
                console.log('Seeded cart items for demo customer.');
            }
        }

        console.log('--- Database Seeding Complete & Verified ---');
    } catch (error) {
        console.error('Database seeding error:', error);
    }
};

module.exports = seedDatabase;

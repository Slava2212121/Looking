export const TRANSLATIONS = {
  en: {
    nav: {
      feed: 'Feed',
      explore: 'Explore',
      chats: 'Chats',
      activity: 'Activity',
      profile: 'Profile',
      settings: 'Settings',
      create: 'Create',
    },
    feed: {
      mix: 'Mix',
      chrono: 'Chronology',
      caughtUp: "You're all caught up!",
      mixControls: {
        friends: 'Friends',
        popular: 'Popular',
        text: 'Text',
        video: 'Video',
        why: 'Why seeing this?'
      }
    },
    widgets: {
      trending: 'Trending Now',
      posts: 'posts',
      showMore: 'Show more',
      stats: {
        title: 'Platform Stats',
        users: 'Registered Users',
        posts: 'Total Posts',
        online: 'Online Now'
      },
      footer: '© 2026 Blend Platform. Created by Slava.',
      terms: 'Terms',
      privacy: 'Privacy',
      cookies: 'Cookies'
    },
    create: {
      title: 'New Blend',
      placeholder: "What's happening?",
      publish: 'Publish',
      chars: 'chars',
      types: {
        note: 'Note',
        card: 'Card',
        clip: 'Clip',
        video: 'Video',
        voice: 'Voice',
      }
    },
    chat: {
      title: 'Messages',
      placeholder: 'Type a message...',
      selectChat: 'Select a chat to start messaging',
      online: 'Online',
      calling: 'Calling...',
      incoming: 'Incoming call...',
      voiceMessage: 'Voice Message',
      holdToRecord: 'Hold to record',
      tabs: {
        all: 'All',
        personal: 'Personal',
        discussion: 'Discussions',
        channel: 'Channels'
      }
    },
    post: {
      clip: 'CLIP',
      comments: 'Comments',
      writeComment: 'Write a comment...',
      shareToast: 'Link copied to clipboard!',
      shares: 'shares'
    },
    explore: {
      search: 'Search Blend...',
      title: 'Explore',
      forYou: 'For You'
    },
    profile: {
      posts: 'Posts',
      followers: 'Followers',
      following: 'Following',
      edit: 'Edit Profile',
      save: 'Save Profile',
      bio: 'Bio',
      noPosts: 'No posts yet',
      badges: {
        creator: 'CREATOR',
        moderator: 'MODERATOR',
        official: 'OFFICIAL',
        active: 'ACTIVE'
      }
    },
    activity: {
      title: 'Activity',
      liked: 'liked your post',
      followed: 'started following you',
      commented: 'commented on your post'
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      privacy: 'Legal',
      security: 'Security & Privacy',
      appearance: 'Appearance',
      themes: 'Themes',
      dark: 'Dark',
      light: 'Light',
      gold: 'Gold',
      logout: 'Log out',
      officialRequest: 'Request Official Status',
      officialPending: 'Application Pending...',
      officialApproved: 'Official Status Active',
      twoFactor: 'Two-Factor Auth (2FA)',
      changePassword: 'Change Password',
      activeSessions: 'Active Sessions',
      activeNow: 'Active Now'
    },
    auth: {
      welcome: 'Welcome to Blend',
      subtitle: 'The unified social platform',
      login: 'Log In',
      register: 'Sign Up',
      email: 'Email address',
      password: 'Password',
      name: 'Full Name',
      handle: 'Handle (@username)',
      rememberMe: 'Remember me',
      submitLogin: 'Log In',
      submitRegister: 'Create Account',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      or: 'OR',
      securityCheck: 'Security Check',
      codeSent: 'We sent a 6-digit code to your email.',
      enterCode: 'Enter verification code',
      verify: 'Verify & Enter',
      resend: 'Resend Code',
      troubleReceiving: 'Trouble receiving code?',
      wrongCode: 'Invalid code. Check console.',
      invalidDomain: 'Only Gmail and Mail.ru are supported',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      newPassword: 'New Password',
      passwordResetSuccess: 'Password reset successfully! Please login.',
      sendRecovery: 'Send Recovery Code',
      backToLogin: 'Back to Login',
      emailTaken: 'An account with this email already exists.'
    },
    legal: {
      terms: {
        title: 'Terms of Service',
        date: 'Last revised: January 29, 2026',
        sections: [
          { heading: '1. General Provisions', content: 'Blend is an open-source social platform. By using our service, you agree to these terms. If you do not agree, please do not use Blend.' },
          { heading: '2. Registration and Account', content: 'You are responsible for the security of your password and access tokens. You agree not to create accounts to impersonate others (fraud) or for automated spamming.' },
          { heading: '3. User Content', content: 'Yours remains yours. You retain all intellectual property rights to the content you publish (notes, clips, videos, audio). By publishing content, you grant Blend a non-exclusive license to display, broadcast, and store this content within the scope of the platform operation.' },
          { heading: '4. Community Guidelines', content: 'It is forbidden to use the platform for: Distributing illegal content; Threats, bullying, and hate speech; Attempts to hack the API or destabilize the Backend.' },
          { heading: '5. No Warranties (AS IS)', content: 'Blend is provided "as is". Since the code is open, we are not responsible for system errors or temporary unavailability of the service. We do not guarantee that your content will be stored forever (make backups!).' }
        ]
      },
      privacy: {
        title: 'Privacy Policy',
        date: 'We value your privacy more than ad budgets.',
        sections: [
          { heading: '1. What Data We Collect', content: 'Profile Information: Login, email (or phone), avatar, and bio. These are necessary for User and Profile entities. Content: Your posts, reactions, comments, and chat messages. Technical Data: IP address (for spam protection), device type, and session data (stored in Redis).' },
          { heading: '2. How We Use Data', content: 'Only to ensure feature operation: generating the "Mix" feed, delivering notifications, and chat functionality. We never sell your data to third parties. We have no ad trackers.' },
          { heading: '3. Storage and Security', content: 'Passwords are stored in encrypted form (hashing). API access is protected via JWT tokens. Your data is stored in a PostgreSQL database.' },
          { heading: '4. Your Rights', content: 'Right to Deletion: You can delete your account at any time. We commit to erasing your personal data from the DB within 30 days (per GDPR principles). Right to Portability: Since we use open standards, you can request an export of your data.' },
          { heading: '5. Open Source', content: 'You can personally verify how your data is processed by examining our source code in the repository. We encourage security audits by the community.' }
        ]
      }
    }
  },
  ru: {
    nav: {
      feed: 'Лента',
      explore: 'Обзор',
      chats: 'Чаты',
      activity: 'Активность',
      profile: 'Профиль',
      settings: 'Настройки',
      create: 'Создать',
    },
    feed: {
      mix: 'Микс',
      chrono: 'Хронология',
      caughtUp: "На этом пока всё!",
      mixControls: {
        friends: 'Друзья',
        popular: 'Популярное',
        text: 'Текст',
        video: 'Видео',
        why: 'Почему я это вижу?'
      }
    },
    widgets: {
      trending: 'Актуальное',
      posts: 'постов',
      showMore: 'Показать еще',
      stats: {
        title: 'Статистика',
        users: 'Пользователей',
        posts: 'Всего постов',
        online: 'Сейчас в сети'
      },
      footer: '© 2026 Blend Platform. Created by Slava.',
      terms: 'Условия',
      privacy: 'Конфиденциальность',
      cookies: 'Cookies'
    },
    create: {
      title: 'Новый Blend',
      placeholder: "Что нового?",
      publish: 'Опубликовать',
      chars: 'симв.',
      types: {
        note: 'Заметка',
        card: 'Карточка',
        clip: 'Клип',
        video: 'Видео',
        voice: 'Голос',
      }
    },
    chat: {
      title: 'Сообщения',
      placeholder: 'Ваше сообщение...',
      selectChat: 'Выберите чат для общения',
      online: 'В сети',
      calling: 'Звонок...',
      incoming: 'Входящий звонок...',
      voiceMessage: 'Голосовое сообщение',
      holdToRecord: 'Удерживайте для записи',
      tabs: {
        all: 'Все',
        personal: 'Личное',
        discussion: 'Обсуждения',
        channel: 'Каналы'
      }
    },
    post: {
      clip: 'КЛИП',
      comments: 'Комментарии',
      writeComment: 'Написать комментарий...',
      shareToast: 'Ссылка скопирована в буфер!',
      shares: 'поделились'
    },
    explore: {
      search: 'Поиск в Blend...',
      title: 'Обзор',
      forYou: 'Для вас'
    },
    profile: {
      posts: 'Посты',
      followers: 'Подписчики',
      following: 'Подписки',
      edit: 'Ред. профиль',
      save: 'Сохранить',
      bio: 'О себе',
      noPosts: 'Пока нет постов',
      badges: {
        creator: 'СОЗДАТЕЛЬ',
        moderator: 'МОДЕРАТОР',
        official: 'ОФИЦИАЛЬНЫЙ',
        active: 'АКТИВНЫЙ'
      }
    },
    activity: {
      title: 'Активность',
      liked: 'оценил(а) ваш пост',
      followed: 'подписался на вас',
      commented: 'прокомментировал(а)'
    },
    settings: {
      title: 'Настройки',
      account: 'Аккаунт',
      privacy: 'Юридическая информация',
      security: 'Конфиденциальность',
      appearance: 'Внешний вид',
      themes: 'Темы',
      dark: 'Темная',
      light: 'Светлая',
      gold: 'Золотая',
      logout: 'Выйти',
      officialRequest: 'Запросить оф. статус',
      officialPending: 'Заявка рассматривается...',
      officialApproved: 'Официальный статус активен',
      twoFactor: 'Двухфакторная аутентификация',
      changePassword: 'Сменить пароль',
      activeSessions: 'Активные сессии',
      activeNow: 'Активен сейчас'
    },
    auth: {
      welcome: 'Добро пожаловать',
      subtitle: 'Единая социальная платформа',
      login: 'Вход',
      register: 'Регистрация',
      email: 'Email адрес',
      password: 'Пароль',
      name: 'Полное имя',
      handle: 'Никнейм (@username)',
      rememberMe: 'Запомнить меня',
      submitLogin: 'Войти',
      submitRegister: 'Создать аккаунт',
      haveAccount: 'Уже есть аккаунт?',
      noAccount: "Нет аккаунта?",
      or: 'ИЛИ',
      securityCheck: 'Проверка безопасности',
      codeSent: 'Мы отправили 6-значный код на ваш email.',
      enterCode: 'Введите код подтверждения',
      verify: 'Подтвердить и войти',
      resend: 'Отправить снова',
      troubleReceiving: 'Не приходит код?',
      wrongCode: 'Неверный код. Проверьте консоль.',
      invalidDomain: 'Поддерживаются только Gmail и Mail.ru',
      forgotPassword: 'Забыли пароль?',
      resetPassword: 'Сброс пароля',
      newPassword: 'Новый пароль',
      passwordResetSuccess: 'Пароль успешно сброшен! Войдите.',
      sendRecovery: 'Отправить код',
      backToLogin: 'Вернуться ко входу',
      emailTaken: 'Аккаунт с таким email уже существует.'
    },
    legal: {
      terms: {
        title: 'Условия использования платформы Blend',
        date: 'Редакция от: 29 января 2026 г.',
        sections: [
          { heading: '1. Общие положения', content: 'Blend — это социальная платформа с открытым исходным кодом. Используя наш сервис, вы соглашаетесь с данными условиями. Если вы не согласны — пожалуйста, не используйте Blend.' },
          { heading: '2. Регистрация и Аккаунт', content: 'Вы несете ответственность за безопасность своего пароля и токенов доступа. Вы обязуетесь не создавать аккаунты для имитации других лиц (фрод) или автоматизированной рассылки спама.' },
          { heading: '3. Контент пользователя', content: 'Ваше — остается вашим. Вы сохраняете все права интеллектуальной собственности на контент, который публикуете (ноты, клипы, видео, аудио). Публикуя контент, вы предоставляете Blend неисключительную лицензию на отображение, трансляцию и хранение этого контента в рамках работы платформы.' },
          { heading: '4. Правила сообщества', content: 'Запрещено использование платформы для: Распространения незаконного контента; Угроз, травли и пропаганды ненависти; Попыток взлома API или дестабилизации работы Backend-части.' },
          { heading: '5. Отсутствие гарантий (AS IS)', content: 'Blend предоставляется «как есть». Поскольку код открыт, мы не несем ответственности за ошибки в работе системы или временную недоступность сервиса. Мы не гарантируем, что ваш контент будет храниться вечно (делайте бэкапы!).' }
        ]
      },
      privacy: {
        title: 'Политика конфиденциальности Blend',
        date: 'Мы ценим вашу приватность больше, чем рекламные бюджеты.',
        sections: [
          { heading: '1. Какие данные мы собираем', content: 'Информация профиля: Логин, email (или телефон), аватар и био. Эти данные необходимы для работы User и Profile сущностей. Контент: Ваши посты, реакции, комментарии и сообщения в чатах. Технические данные: IP-адрес (для защиты от спама), тип устройства и данные сессий (хранятся в Redis).' },
          { heading: '2. Как мы используем данные', content: 'Только для обеспечения работы функций: формирования ленты «Микс», доставки уведомлений и работы чатов. Мы никогда не продаем ваши данные третьим лицам. У нас нет рекламных трекеров.' },
          { heading: '3. Хранение и безопасность', content: 'Пароли хранятся в зашифрованном виде (хеширование). Доступ к API защищен с помощью JWT-токенов. Ваши данные хранятся в базе данных PostgreSQL.' },
          { heading: '4. Ваши права', content: 'Право на удаление: Вы можете в любой момент удалить свой аккаунт. Мы обязуемся стереть ваши личные данные из БД в течение 30 дней (согласно принципам GDPR). Право на переносимость: Поскольку мы используем открытые стандарты, вы можете запросить экспорт своих данных.' },
          { heading: '5. Открытый код', content: 'Вы можете лично проверить, как обрабатываются ваши данные, изучив наш исходный код в репозитории. Мы поощряем аудит безопасности со стороны сообщества.' }
        ]
      }
    }
  },
  zh: {
    nav: {
      feed: '动态',
      explore: '探索',
      chats: '消息',
      activity: '通知',
      profile: '我',
      settings: '设置',
      create: '发布',
    },
    feed: {
      mix: '推荐',
      chrono: '最新',
      caughtUp: "已经到底啦！",
      mixControls: {
        friends: '好友',
        popular: '热门',
        text: '文字',
        video: '视频',
        why: '为什么看到这个？'
      }
    },
    widgets: {
      trending: '热门话题',
      posts: '帖子',
      showMore: '查看更多',
      stats: {
        title: '平台统计',
        users: '注册用户',
        posts: '帖子总数',
        online: '在线人数'
      },
      footer: '© 2026 Blend Platform. Created by Slava.',
      terms: '条款',
      privacy: '隐私',
      cookies: 'Cookie'
    },
    create: {
      title: '发布 Blend',
      placeholder: "发生什么事了？",
      publish: '发布',
      chars: '字',
      types: {
        note: '笔记',
        card: '图文',
        clip: '短视频',
        video: '视频',
        voice: '语音',
      }
    },
    chat: {
      title: '消息',
      placeholder: '输入消息...',
      selectChat: '选择一个对话开始聊天',
      online: '在线',
      calling: '呼叫中...',
      incoming: '来电...',
      voiceMessage: '语音信息',
      holdToRecord: '按住录音',
      tabs: {
        all: '全部',
        personal: '私信',
        discussion: '讨论',
        channel: '频道'
      }
    },
    post: {
      clip: '短视频',
      comments: '评论',
      writeComment: '写评论...',
      shareToast: '链接已复制！',
      shares: '分享'
    },
    explore: {
      search: '搜索 Blend...',
      title: '探索',
      forYou: '推荐'
    },
    profile: {
      posts: '帖子',
      followers: '粉丝',
      following: '关注',
      edit: '编辑资料',
      save: '保存资料',
      bio: '简介',
      noPosts: '暂无帖子',
      badges: {
        creator: '创作者',
        moderator: '版主',
        official: '官方',
        active: '活跃'
      }
    },
    activity: {
      title: '通知',
      liked: '赞了你的帖子',
      followed: '关注了你',
      commented: '评论了你的帖子'
    },
    settings: {
      title: '设置',
      account: '账号',
      privacy: '法律',
      security: '安全和隐私',
      appearance: '外观',
      themes: '主题',
      dark: '黑暗',
      light: '光',
      gold: '金子',
      logout: '退出登录',
      officialRequest: '请求官方身份',
      officialPending: '申请待处理...',
      officialApproved: '官方身份有效',
      twoFactor: '双因素身份验证',
      changePassword: '更改密码',
      activeSessions: '活动会话',
      activeNow: '当前在线'
    },
    auth: {
      welcome: '欢迎来到 Blend',
      subtitle: '统一社交平台',
      login: '登录',
      register: '注册',
      email: '电子邮箱',
      password: '密码',
      name: '全名',
      handle: '用户名 (@username)',
      rememberMe: '记住我',
      submitLogin: '登录',
      submitRegister: '创建账户',
      haveAccount: '已有账户？',
      noAccount: "还没有账户？",
      or: '或',
      securityCheck: '安全检查',
      codeSent: '我们已向您的邮箱发送了6位验证码。',
      enterCode: '输入验证码',
      verify: '验证并登录',
      resend: '重新发送',
      troubleReceiving: '收不到验证码？',
      wrongCode: '验证码无效。尝试 123456',
      invalidDomain: '仅支持 Gmail 和 Mail.ru',
      forgotPassword: '忘记密码？',
      resetPassword: '重置密码',
      newPassword: '新密码',
      passwordResetSuccess: '密码重置成功！请登录。',
      sendRecovery: '发送恢复代码',
      backToLogin: '返回登录',
      emailTaken: '该电子邮件的帐户已存在。'
    },
    legal: {
      terms: {
        title: '服务条款',
        date: '修订日期：2026年1月29日',
        sections: [
          { heading: '1. 一般规定', content: 'Blend 是一个开源社交平台。使用我们的服务即表示您同意这些条款。如果您不同意，请不要使用 Blend。' },
          { heading: '2. 注册和账户', content: '您有责任确保您的密码和访问令牌的安全。您同意不创建账户来冒充他人（欺诈）或进行自动垃圾邮件发送。' },
          { heading: '3. 用户内容', content: '您的内容属于您。您保留您发布的任何内容（笔记、剪辑、视频、音频）的所有知识产权。通过发布内容，您授予 Blend 非独家许可，以便在平台运营范围内展示、广播和存储该内容。' },
          { heading: '4. 社区准则', content: '禁止将平台用于：传播非法内容；威胁、欺凌和仇恨言论；试图入侵 API 或破坏后端稳定性。' },
          { heading: '5. 无担保 (AS IS)', content: 'Blend 按“原样”提供。由于代码是开源的，我们不对系统错误或服务的暂时不可用负责。我们不保证您的内容将永远存储（请进行备份！）。' }
        ]
      },
      privacy: {
        title: '隐私政策',
        date: '我们比广告预算更重视您的隐私。',
        sections: [
          { heading: '1. 我们收集什么数据', content: '个人资料信息：登录名、电子邮件（或电话）、头像和简介。这些对于用户和个人资料实体是必需的。内容：您的帖子、反应、评论和聊天消息。技术数据：IP 地址（用于防垃圾邮件）、设备类型和会话数据（存储在 Redis 中）。' },
          { heading: '2. 我们如何使用数据', content: '仅用于确保功能运行：生成“混合”提要、传递通知和聊天功能。我们从不将您的数据出售给第三方。我们没有广告跟踪器。' },
          { heading: '3. 存储和安全', content: '密码以加密形式存储（哈希）。API 访问受 JWT 令牌保护。您的数据存储在 PostgreSQL 数据库中。' },
          { heading: '4. 您的权利', content: '删除权：您可以随时删除您的帐户。我们承诺在 30 天内从数据库中删除您的个人数据（根据 GDPR 原则）。可移植权：由于我们使用开放标准，您可以请求导出您的数据。' },
          { heading: '5. 开源', content: '您可以通过检查存储库中的源代码来亲自验证您的数据是如何被处理的。我们鼓励社区进行安全审计。' }
        ]
      }
    }
  }
};
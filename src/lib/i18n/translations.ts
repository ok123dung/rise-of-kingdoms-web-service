export type Language = 'vi' | 'en'

export const translations = {
  vi: {
    common: {
      home: 'Trang chủ',
      services: 'Dịch vụ',
      guides: 'Hướng dẫn',
      alliance: 'Liên minh',
      login: 'Đăng nhập',
      bookNow: 'Đặt dịch vụ ngay',
      contact: 'Liên hệ',
      about: 'Về chúng tôi',
      terms: 'Điều khoản',
      privacy: 'Bảo mật',
      consulting: 'Tư vấn miễn phí'
    },
    hero: {
      badge: '#1 Dịch vụ RoK tại Việt Nam',
      title: 'Dịch vụ chuyên nghiệp cho',
      subtitle:
        'Nâng cao trải nghiệm chơi game của bạn với các dịch vụ chuyên nghiệp từ đội ngũ top player hàng đầu Việt Nam.',
      ctaPrimary: 'Khám phá dịch vụ',
      ctaSecondary: 'Hướng dẫn miễn phí',
      stats: {
        customers: 'Khách hàng tin tưởng',
        alliances: 'Liên minh được hỗ trợ',
        rating: 'Đánh giá trung bình'
      }
    },
    autoService: {
      title: 'Chi tiết dịch vụ',
      subtitle: 'Chuyên nghiệp hóa',
      desc: 'Hệ thống tự động hóa thông minh giúp bạn tối ưu thời gian và hiệu quả chơi game',
      features: {
        army: {
          name: 'Tối ưu hóa quân đội',
          desc: 'Sắp xếp và tối ưu hóa quân đội để tăng cường hiệu suất đua top.'
        },
        shield: { name: 'Bảo vệ tài khoản', desc: 'Sẵn sàng bật khiên tự động nếu bị tấn công.' },
        smith: {
          name: 'Rèn & Sản xuất',
          desc: 'Rèn nguyên liệu liên tục, đảm bảo sản xuất luôn đầy.'
        },
        heal: {
          name: 'Chữa thương & Rèn lính',
          desc: 'Tự động chữa thương và rèn lính theo cài đặt.'
        },
        pilot: { name: 'Pilot hỗ trợ', desc: 'Pilot túc trực hỗ trợ đánh man và rally pháo đài.' },
        gem: { name: 'Đào Gem hiệu quả', desc: 'Hoạt động đào gem: 4-15k gem/ngày.' },
        travel: {
          name: 'Du lịch & Điều động',
          desc: 'Thực hiện đầy đủ hoạt động du lịch và điều động.'
        },
        report: {
          name: 'Báo cáo thường xuyên',
          desc: 'Cập nhật liên tục về tiến trình và thành tích.'
        }
      }
    },
    requirements: {
      title: 'Yêu cầu tài khoản',
      subtitle: 'Để đảm bảo hiệu quả tối đa, tài khoản của bạn cần đáp ứng các yêu cầu sau',
      k1: 'Kingdom 1 - RC',
      k2: 'Kingdom 2 - 3',
      k4: 'Kingdom 4 trở lên',
      note: 'Lưu ý: Trong quá trình làm, bạn có thể cùng chúng tôi canh thời gian di tích mở để tham gia đẩy nhanh quá trình lên top.',
      list: {
        k1: ['Yi Seong-Gye (5111)', 'Yi max (càng sớm càng tốt)', 'AP: 150k - 200k'],
        k2: ['Yi Seong-Gye max', 'Tướng đánh lan khác', 'AP: 200k - 250k'],
        k4: ['Tướng đánh lan mạnh', 'AP: 350k trở lên', 'Đủ RSS chữa thương']
      }
    },
    pricing: {
      title: 'Bảng giá dịch vụ',
      subtitle:
        'Chọn gói dịch vụ phù hợp với nhu cầu của bạn. Cam kết hoàn tiền nếu không hài lòng.',
      week: {
        name: 'Gói Tuần',
        desc: 'Dành cho người mới trải nghiệm dịch vụ',
        period: '/tuần',
        features: [
          'Farm gem 4-15k/ngày (bất tử)',
          'Bấm help liên minh',
          'Mua shop VIP & Thương nhân',
          'Bật khiên tự động khi bị tấn công',
          'Chữa lính tự động',
          'Farm RSS, Hộp, SK 7k gem'
        ]
      },
      v1: {
        name: 'Gói V1',
        desc: 'Gói cơ bản đầy đủ tính năng',
        period: '/tháng',
        discount: '3 tháng: 2tr | 5 tháng: 3tr25',
        features: [
          'Tất cả tính năng gói tuần',
          'Nhặt hang làng, dò sương mù',
          'Luyện lính mặc định',
          'Donate liên minh',
          'Nhặt quà sự kiện, nhiệm vụ ngày',
          'Chia nhỏ số lần chữa lính'
        ]
      },
      v2: {
        name: 'Gói V2',
        desc: 'Gói nâng cao tối ưu hóa toàn diện',
        period: '/tháng',
        discount: '3 tháng: 2tr5 | 5 tháng: 3tr7',
        features: [
          'Tất cả tính năng gói V1',
          'Kéo man tay thường xuyên',
          'Luyện lính & Mua đồ chi tiết',
          'Set mua speed gem giảm 70%',
          'Luyện vật liệu',
          'Đánh man rợ xả AP theo yêu cầu',
          'Hỗ trợ làm sự kiện (Man, RSS, Hộp...)',
          'Du lịch & Điều động'
        ]
      },
      special: {
        name: 'Gói Đặc Biệt (KvK)',
        desc: 'Kéo top danh dự, bao thua KvK',
        period: '/mùa',
        features: [
          'Kéo top danh dự KvK',
          'Bao thua KvK',
          'Chạy 24/7 cả mùa KvK',
          'Tối ưu hóa điểm danh dự',
          'Pilot túc trực hỗ trợ đánh man/rally'
        ]
      },
      cta: 'Đăng ký ngay',
      popular: 'Phổ biến nhất'
    },
    features: {
      time: {
        title: 'Tiết kiệm thời gian',
        desc: 'Đội ngũ của chúng tôi sẽ hoạt động liên tục, bạn chỉ cần canh thời điểm giao tranh di tích và thưởng thức thành quả.'
      },
      results: {
        title: 'Kết quả cao',
        desc: 'Với bề dày kinh nghiệm và kỹ năng của chúng tôi tự tin sẽ đưa bạn lên hàng top danh dự và sự kiện.'
      },
      safety: {
        title: 'An toàn & Tin cậy',
        desc: 'Chúng tôi đảm bảo an toàn tuyệt đối cho tài khoản và thông tin cá nhân của bạn. Cam kết bảo mật 100%.'
      }
    },
    services: {
      'auto-gem-farm': {
        name: 'Auto Gem & Farm RoK',
        short_description: 'Auto Farm Gem & RSS 24/7',
        description:
          'Dịch vụ Auto Farm Gem và Tài nguyên chuyên nghiệp, an toàn 99%, bảo hành uy tín. Hệ thống hoạt động 24/7 giúp bạn tối ưu hóa tài nguyên.',
        features: [
          'Farm 4k-15k gem/ngày',
          'Chống ban 99% (Bảo hành 1 đền 1)',
          'Tự động mua shop VIP & Thương nhân',
          'Hỗ trợ làm sự kiện & đánh man',
          'Bật khiên tự động khi bị tấn công'
        ],
        benefits: [
          'Tiết kiệm thời gian cày cuốc',
          'Tối ưu hóa lượng Gem và RSS',
          'An toàn tuyệt đối với bảo hành',
          'Hỗ trợ 24/7 qua Zalo/Discord'
        ],
        pricing: [
          {
            tier: 'Gói Tuần',
            price: 150000,
            duration: '1 tuần',
            features: [
              'Farm gem 4-15k/ngày',
              'Bấm help liên minh',
              'Mua shop VIP & Thương nhân',
              'Bật khiên tự động',
              'Farm RSS, Hộp, SK 7k gem'
            ]
          },
          {
            tier: 'Gói V1',
            price: 750000,
            duration: '1 tháng',
            features: [
              'Tất cả tính năng gói tuần',
              'Nhặt hang làng, dò sương mù',
              'Luyện lính mặc định',
              'Donate liên minh',
              'Nhặt quà sự kiện, nhiệm vụ ngày'
            ]
          },
          {
            tier: 'Gói V2',
            price: 900000,
            duration: '1 tháng',
            features: [
              'Tất cả tính năng gói V1',
              'Kéo man tay thường xuyên',
              'Luyện lính & Mua đồ chi tiết',
              'Set mua speed gem giảm 70%',
              'Luyện vật liệu & Đánh man rợ xả AP'
            ]
          },
          {
            tier: 'Gói Đặc Biệt',
            price: 7000000,
            duration: '1 mùa KvK',
            features: [
              'Kéo top danh dự KvK',
              'Bao thua KvK',
              'Chạy 24/7 cả mùa KvK',
              'Tối ưu hóa điểm danh dự',
              'Hỗ trợ chiến thuật'
            ]
          }
        ]
      },
      'strategy-consulting': {
        name: 'Tư vấn chiến thuật',
        short_description: 'Tối ưu hóa tài khoản và chiến thuật',
        description:
          'Tư vấn xây dựng tài khoản, phát triển commander và equipment tối ưu nhất. Đội ngũ chuyên gia giúp bạn có lộ trình phát triển rõ ràng.',
        features: [
          'Phân tích tài khoản chuyên sâu',
          'Gợi ý Commander tối ưu',
          'Lộ trình phát triển chi tiết',
          'Tối ưu Equipment & Talents',
          'Support 1-1 với chuyên gia'
        ],
        benefits: [
          'Tiết kiệm thời gian nghiên cứu',
          'Tránh sai lầm người mới thường mắc',
          'Phát triển đúng hướng ngay từ đầu',
          'Được tư vấn bởi top player'
        ],
        pricing: [
          {
            tier: 'Cơ bản',
            price: 500000,
            duration: '1 tháng',
            features: [
              'Phân tích tài khoản',
              'Gợi ý Commander',
              'Lộ trình 1 tháng',
              'Hỗ trợ qua Discord',
              'Báo cáo tiến độ'
            ]
          },
          {
            tier: 'Nâng cao',
            price: 1500000,
            duration: '3 tháng',
            features: [
              'Phân tích chuyên sâu',
              'Tối ưu Equipment',
              'Lộ trình 3 tháng',
              'Support 1-1 với chuyên gia',
              'Review định kỳ hàng tuần'
            ]
          }
        ]
      },
      'kvk-support': {
        name: 'Hỗ trợ KvK',
        short_description: 'Hỗ trợ đánh KvK chuyên nghiệp',
        description:
          'Dịch vụ hỗ trợ đi đánh KvK, đảm bảo kill points và death theo yêu cầu. Online 24/7 trong suốt mùa KvK.',
        features: [
          'Đạt mốc Kill Points yêu cầu',
          'Đảm bảo Death theo thỏa thuận',
          'Online 24/7 trong KvK',
          'Livestream báo cáo tiến độ',
          'Pilot túc trực hỗ trợ rally'
        ],
        benefits: [
          'Không cần thức đêm đánh KvK',
          'Đảm bảo đạt mục tiêu Kill Points',
          'Có báo cáo chi tiết',
          'Được hỗ trợ bởi đội ngũ chuyên nghiệp'
        ],
        pricing: [
          {
            tier: 'Gói T4',
            price: 2000000,
            duration: '1 mùa KvK',
            features: [
              'Đạt mốc Kill Points',
              'Đảm bảo Death',
              'Online 24/7',
              'Báo cáo hàng ngày',
              'Hỗ trợ qua Discord'
            ]
          },
          {
            tier: 'Gói T5',
            price: 5000000,
            duration: '1 mùa KvK',
            features: [
              'Đạt mốc Kill Points cao',
              'Đảm bảo Death tối ưu',
              'Online 24/7',
              'Livestream báo cáo',
              'Pilot hỗ trợ rally/garrison'
            ]
          }
        ]
      },
      'account-maintenance': {
        name: 'Chăm sóc tài khoản',
        short_description: 'Daily login và làm nhiệm vụ',
        description:
          'Dịch vụ đăng nhập hàng ngày, làm nhiệm vụ, thu gom tài nguyên. Giúp bạn không bỏ lỡ bất kỳ phần thưởng nào.',
        features: [
          'Login hàng ngày',
          'Làm daily quest đầy đủ',
          'Thu gom resource tự động',
          'Tham gia sự kiện',
          'Báo cáo định kỳ'
        ],
        benefits: [
          'Không bỏ lỡ daily rewards',
          'Tối ưu resource thu thập',
          'Tiết kiệm thời gian hàng ngày',
          'Tài khoản luôn active'
        ],
        pricing: [
          {
            tier: 'Tuần',
            price: 300000,
            duration: '1 tuần',
            features: [
              'Login hàng ngày',
              'Làm daily quest',
              'Thu gom resource',
              'Báo cáo cuối tuần',
              'Hỗ trợ qua Discord'
            ]
          },
          {
            tier: 'Tháng',
            price: 1000000,
            duration: '1 tháng',
            features: [
              'Login hàng ngày',
              'Full sự kiện',
              'Tối ưu tăng tốc',
              'Báo cáo hàng tuần',
              'Ưu tiên support'
            ]
          }
        ]
      }
    }
  },
  en: {
    common: {
      home: 'Home',
      services: 'Services',
      guides: 'Guides',
      alliance: 'Alliance',
      login: 'Login',
      bookNow: 'Book Now',
      contact: 'Contact',
      about: 'About Us',
      terms: 'Terms',
      privacy: 'Privacy',
      consulting: 'Free Consultation'
    },
    hero: {
      badge: '#1 RoK Service in Vietnam',
      title: 'Professional Services for',
      subtitle: 'Elevate your gaming experience with professional services from top-tier players.',
      ctaPrimary: 'Explore Services',
      ctaSecondary: 'Free Guides',
      stats: {
        customers: 'Trusted Customers',
        alliances: 'Supported Alliances',
        rating: 'Average Rating'
      }
    },
    autoService: {
      title: 'Service Details',
      subtitle: 'Professionalization',
      desc: 'Smart automation system helps optimize your time and gaming efficiency',
      features: {
        army: {
          name: 'Army Optimization',
          desc: 'Organize and optimize troops for peak performance.'
        },
        shield: { name: 'Account Protection', desc: 'Auto-shield activation when under attack.' },
        smith: {
          name: 'Smithing & Production',
          desc: 'Continuous material smithing, ensuring full production.'
        },
        heal: {
          name: 'Healing & Training',
          desc: 'Auto healing and troop training as configured.'
        },
        pilot: { name: 'Pilot Support', desc: 'Pilot on standby for barbarian and fort rallies.' },
        gem: { name: 'Efficient Gem Mining', desc: 'Gem farming: 4-15k gems/day.' },
        travel: {
          name: 'Travel & Mobilization',
          desc: 'Execute full travel and mobilization activities.'
        },
        report: {
          name: 'Regular Reports',
          desc: 'Continuous updates on progress and achievements.'
        }
      }
    },
    requirements: {
      title: 'Account Requirements',
      subtitle:
        'To ensure maximum efficiency, your account needs to meet the following requirements',
      k1: 'Kingdom 1 - RC',
      k2: 'Kingdom 2 - 3',
      k4: 'Kingdom 4 and above',
      note: 'Note: During the process, you can join us to time the ruins opening to accelerate the ranking process.',
      list: {
        k1: ['Yi Seong-Gye (5111)', 'Yi max (as soon as possible)', 'AP: 150k - 200k'],
        k2: ['Yi Seong-Gye max', 'Other AOE Commanders', 'AP: 200k - 250k'],
        k4: ['Strong AOE Commanders', 'AP: 350k or more', 'Enough RSS for healing']
      }
    },
    pricing: {
      title: 'Service Pricing',
      subtitle: 'Choose the plan that suits your needs. Money-back guarantee if not satisfied.',
      week: {
        name: 'Weekly Plan',
        desc: 'For new users to experience the service',
        period: '/week',
        features: [
          'Farm gem 4-15k/day (immortal)',
          'Alliance Help',
          'Buy VIP shop & Merchant',
          'Auto shield when attacked',
          'Auto healing',
          'Farm RSS, Chests, 7k gem event'
        ]
      },
      v1: {
        name: 'V1 Plan',
        desc: 'Basic plan with full features',
        period: '/month',
        discount: '3 months: 2m | 5 months: 3.25m',
        features: [
          'All Weekly Plan features',
          'Collect tribal villages, explore fog',
          'Default troop training',
          'Alliance donation',
          'Collect event rewards, daily quests',
          'Split healing sessions'
        ]
      },
      v2: {
        name: 'V2 Plan',
        desc: 'Advanced plan with comprehensive optimization',
        period: '/month',
        discount: '3 months: 2.5m | 5 months: 3.7m',
        features: [
          'All V1 Plan features',
          'Manual barbarian farming regularly',
          'Detailed troop training & purchasing',
          'Set speedup buying (70% off)',
          'Material crafting',
          'Barbarian farming to dump AP on request',
          'Event support (Barbarians, RSS, Chests...)',
          'Travel & Mobilization'
        ]
      },
      special: {
        name: 'Special Plan (KvK)',
        desc: 'Honor ranking boost, KvK guarantee',
        period: '/season',
        features: [
          'KvK Honor Ranking Boost',
          'KvK Win/Loss Guarantee',
          'Run 24/7 throughout KvK season',
          'Honor Point Optimization',
          'Pilot standby for barbarians/rallies'
        ]
      },
      cta: 'Register Now',
      popular: 'Most Popular'
    },
    features: {
      time: {
        title: 'Save Time',
        desc: 'Our team works continuously, you just need to time the ruins fights and enjoy the results.'
      },
      results: {
        title: 'High Results',
        desc: 'With our extensive experience and skills, we are confident to bring you to the top rankings.'
      },
      safety: {
        title: 'Safe & Reliable',
        desc: 'We ensure absolute safety for your account and personal information. 100% security commitment.'
      }
    },
    services: {
      'auto-gem-farm': {
        name: 'Auto Gem & Farm RoK',
        short_description: 'Auto Farm Gem & RSS 24/7',
        description:
          'Professional Auto Farm Gem and Resources service, 99% safe, reputable warranty. 24/7 system helps you optimize resources.',
        features: [
          'Farm 4k-15k gems/day',
          '99% Anti-ban (1-to-1 Warranty)',
          'Auto buy VIP shop & Merchant',
          'Support events & barbarians',
          'Auto shield when attacked'
        ],
        benefits: [
          'Save grinding time',
          'Optimize Gems and RSS',
          'Absolute safety with warranty',
          '24/7 Support via Zalo/Discord'
        ],
        pricing: [
          {
            tier: 'Weekly Plan',
            price: 150000,
            duration: '1 week',
            features: [
              'Farm gem 4-15k/day',
              'Alliance Help',
              'Buy VIP shop & Merchant',
              'Auto shield',
              'Farm RSS, Chests, 7k gem event'
            ]
          },
          {
            tier: 'V1 Plan',
            price: 750000,
            duration: '1 month',
            features: [
              'All Weekly Plan features',
              'Collect tribal villages, explore fog',
              'Default troop training',
              'Alliance donation',
              'Collect event rewards, daily quests'
            ]
          },
          {
            tier: 'V2 Plan',
            price: 900000,
            duration: '1 month',
            features: [
              'All V1 Plan features',
              'Manual barbarian farming regularly',
              'Detailed troop training & purchasing',
              'Set speedup buying (70% off)',
              'Material crafting & Dump AP on request'
            ]
          },
          {
            tier: 'Special Plan',
            price: 7000000,
            duration: '1 KvK season',
            features: [
              'KvK Honor Ranking Boost',
              'KvK Win/Loss Guarantee',
              'Run 24/7 throughout KvK season',
              'Honor Point Optimization',
              'Tactical Support'
            ]
          }
        ]
      },
      'strategy-consulting': {
        name: 'Strategy Consulting',
        short_description: 'Optimize account and strategy',
        description:
          'Account building consultation, commander development and optimal equipment. Our expert team helps you have a clear development roadmap.',
        features: [
          'In-depth account analysis',
          'Optimal Commander suggestions',
          'Detailed development roadmap',
          'Equipment & Talents optimization',
          '1-1 Support with experts'
        ],
        benefits: [
          'Save research time',
          'Avoid common newbie mistakes',
          'Develop in the right direction from the start',
          'Consultation by top players'
        ],
        pricing: [
          {
            tier: 'Basic',
            price: 500000,
            duration: '1 month',
            features: [
              'Account analysis',
              'Commander suggestions',
              '1-month roadmap',
              'Discord support',
              'Progress reports'
            ]
          },
          {
            tier: 'Advanced',
            price: 1500000,
            duration: '3 months',
            features: [
              'In-depth analysis',
              'Equipment optimization',
              '3-month roadmap',
              '1-1 expert support',
              'Weekly review sessions'
            ]
          }
        ]
      },
      'kvk-support': {
        name: 'KvK Support',
        short_description: 'Professional KvK battle support',
        description:
          'KvK battle support service, guaranteed kill points and death as required. Online 24/7 throughout the KvK season.',
        features: [
          'Achieve required Kill Points',
          'Guaranteed Death as agreed',
          'Online 24/7 during KvK',
          'Livestream progress reports',
          'Pilot standby for rally support'
        ],
        benefits: [
          'No need to stay up late for KvK',
          'Guaranteed to reach Kill Points target',
          'Detailed reports available',
          'Supported by professional team'
        ],
        pricing: [
          {
            tier: 'T4 Package',
            price: 2000000,
            duration: '1 KvK season',
            features: [
              'Achieve Kill Points milestone',
              'Guaranteed Death',
              'Online 24/7',
              'Daily reports',
              'Discord support'
            ]
          },
          {
            tier: 'T5 Package',
            price: 5000000,
            duration: '1 KvK season',
            features: [
              'Achieve high Kill Points',
              'Optimal Death guarantee',
              'Online 24/7',
              'Livestream reports',
              'Pilot for rally/garrison'
            ]
          }
        ]
      },
      'account-maintenance': {
        name: 'Account Maintenance',
        short_description: 'Daily login and quests',
        description:
          'Daily login service, completing quests, collecting resources. Ensuring you never miss any rewards.',
        features: [
          'Daily login',
          'Complete daily quests',
          'Auto resource collection',
          'Event participation',
          'Regular reports'
        ],
        benefits: [
          'Never miss daily rewards',
          'Optimize resource collection',
          'Save daily time',
          'Account always active'
        ],
        pricing: [
          {
            tier: 'Weekly',
            price: 300000,
            duration: '1 week',
            features: [
              'Daily login',
              'Daily quests',
              'Resource collection',
              'Weekly report',
              'Discord support'
            ]
          },
          {
            tier: 'Monthly',
            price: 1000000,
            duration: '1 month',
            features: [
              'Daily login',
              'Full event participation',
              'Speedup optimization',
              'Weekly reports',
              'Priority support'
            ]
          }
        ]
      }
    }
  }
}

// Testimonials with Marquee component
function TestimonialCard({ text, author }) {
  return (
    <div
      className="flex flex-col rounded-xl border border-gray-200
        bg-gradient-to-b from-gray-50/50 to-gray-50/10
        p-6 text-start
        hover:from-gray-50/60 hover:to-gray-50/20
        w-[320px] h-[220px]
        shadow-sm hover:shadow transition-all duration-300"
    >
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-4">"{text}"</p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 shadow-xs">
          <img
            className="aspect-square h-full w-full"
            src={author.avatar}
            alt={author.name}
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-medium leading-none">{author.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{author.position}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsMarquee({ title, subtitle, testimonials }) {
  return (
    <section className="py-16 md:py-24 bg-white text-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">{subtitle}</p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex overflow-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 py-4">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`set1-${i}`}
                  text={testimonial.text}
                  author={testimonial.author}
                />
              ))}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`set2-${i}`}
                  text={testimonial.text}
                  author={testimonial.author}
                />
              ))}
            </div>

            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-8 py-4">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`set3-${i}`}
                  text={testimonial.text}
                  author={testimonial.author}
                />
              ))}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`set4-${i}`}
                  text={testimonial.text}
                  author={testimonial.author}
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

// German reviews data
const testimonialData = [
  {
    text: 'Das BPER Blutdruckmessgerät hat mein Leben verändert. Die Echtzeit-Überwachung gibt mir endlich die Sicherheit, die ich gesucht habe. Besonders gut gefällt mir die App-Integration.',
    author: {
      name: 'Thomas Müller',
      position: 'Herzpatient seit 5 Jahren',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  },
  {
    text: 'Als Ärztin empfehle ich meinen Patienten das BPER System. Die Daten sind präzise und die kontinuierliche Überwachung liefert wertvolle Einblicke für eine bessere Behandlung.',
    author: {
      name: 'Dr. Sabine Weber',
      position: 'Kardiologin',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  },
  {
    text: 'Endlich muss ich nicht mehr mehrmals täglich manuell meinen Blutdruck messen. Die automatischen Warnungen haben mir schon zweimal in kritischen Situationen geholfen!',
    author: {
      name: 'Klaus Becker',
      position: 'Bluthochdruckpatient',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  },
  {
    text: 'Die Berichte, die ich meinem Arzt zeigen kann, sind umfassend und leicht verständlich. Ein großer Fortschritt gegenüber den sporadischen Messungen in der Praxis.',
    author: {
      name: 'Martina Schmidt',
      position: 'Nutzerin seit 6 Monaten',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  },
  {
    text: 'Als Sportler nutze ich BPER, um meine kardiovaskuläre Gesundheit zu überwachen. Die Trends über die Zeit sind besonders nützlich für mein Training.',
    author: {
      name: 'Jan Hoffmann',
      position: 'Marathonläufer',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  },
];

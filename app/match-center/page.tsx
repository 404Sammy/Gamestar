{/* SOCIAL MEDIA FEED */}
        {announcements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <Megaphone className="w-5 h-5 text-fuchsia-500" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Tournament Feed</h2>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory custom-scrollbar">
              {announcements.map(post => (
                <div key={post.id} className="snap-start flex-shrink-0 w-[300px] sm:w-[350px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
                  
                  {/* NEW: DYNAMIC MEDIA RENDERER */}
                  {post.media_url ? (
                    post.media_type === 'video' ? (
                      <video 
                        src={post.media_url} 
                        autoPlay loop muted playsInline controls 
                        className="h-48 w-full object-cover border-b border-slate-800 bg-black" 
                      />
                    ) : (
                      <div className="h-48 w-full bg-cover bg-center border-b border-slate-800" style={{ backgroundImage: `url(${post.media_url})` }} />
                    )
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-fuchsia-500 to-blue-500 w-full" />
                  )}

                  <div className="p-4 flex-grow flex flex-col">
                    <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest bg-slate-950 border-slate-800 text-slate-400">
                      {post.type === 'Highlight' ? <Video className="w-3 h-3 mr-1 text-fuchsia-400" /> : <Megaphone className="w-3 h-3 mr-1 text-blue-400" />}
                      {post.type}
                    </Badge>
                    <h3 className="font-bold text-lg leading-tight mb-2 text-white">{post.title}</h3>
                    <p className="text-sm text-slate-400 flex-grow whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
# Decision log

Your methods section. About one page total.

Answer these as you go, not the night before it is due.
Specifics beat polish - a short honest answer is worth more than a long vague one.

Delete these instructions when you are done, or leave them. It does not matter.

---

## 1. What did you set out to build, and what changed?

What you wanted at the start, and what is actually live now.
Name one thing you dropped or added along the way, and why.

I wanted a personal porfolio website from the start. Originally, I wanted to add more visual effects, such as a light 
that would follow the cursor. This would have been pretty easy to implement yet I think the simplicity of the design works 
well for what this project is.

---

## 2. A fork in the road

Name one real choice where you could have gone two ways.
Plain HTML or a framework. One page or several. Your own CSS or someone's template.
What goes on the front page and what does not.

Say which you picked, what the alternative was, and what you gave up by not taking it.

"There was no alternative" is not an answer. Find the fork.

I did a lot of work in Vue over the summer at my internship and I actually decided to steer away from this to not add
any complexity with the build. The concrete version is specific to this repo: Pages is serving main at / (root), so a 
Vue build would have forced me to either commit dist/ or switch Pages over to an Actions deploy — i.e. it would have 
put a build step inside the pipeline. So, I am just using plain-HTML to serve the site. The tradeoff here to me is that
I will not have the modularity that Vue provides via components. I will instead have to piece each of the sections out within HTML.


---

## 3. Where you overruled the agent

One time Claude suggested, wrote, or claimed something and you did not take it.

What did it do? How did you notice? What did you do instead?

If it genuinely never happened, say so plainly, and then say what you would have had to
check in order to notice. Being honest here costs you far less than a story you cannot
defend when you record your video.

Originally the agent was pushing back on having the visual wave effect in the navigation container. I overruled this decision
and went with the contained version anyway. I think it looks better this way as I originally had the visual effect spanning the entire
width of the site.

---

## 4. How you know it works

What check did you run, and what did it tell you?

Then the real question: **what would have made this check fail?**
A check that could not have failed is not a check.

Link to your `verification/` folder.

I checked the live website from outside my laptop, not localhost. The check did three things:

1. It loaded https://cgiere.github.io and looked for content that only exists in the newest build.
2. It checked that all required files (style.css, app.js, resume.pdf, and the two fonts) loaded successfully.
3. It compared my local Git commit with the commit GitHub actually had.

The results are in verification/fetch.txt.

A simple check for a 200 status on the homepage would not have been enough. The site was still showing an older version even though it returned 200. Checking for content unique to the new build caught this problem.

The asset checks would fail if any file returned a 404, which could cause the page to load but appear unstyled. The Git SHA check would fail if my commit had not actually reached GitHub. This happened once when a push stalled waiting for credentials but incorrectly reported success. Comparing the SHAs showed that the commit was still only on my computer.

---

## 5. What is still wrong

One thing on your own site that is not right, not finished, or that you do not
fully understand.

What would you do next, and how would you find out?

I would have included more personal material about myself and maybe included a profile shot. It could be fun to add in the 
cursor effect I talk about in question 1 or maybe some more dynamic components to draw the user into the experience.

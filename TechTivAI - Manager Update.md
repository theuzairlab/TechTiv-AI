# TechTivAI — Manager update

27 October 2026

The product from the Final Developer Agenda is live. This note is the current system, in order, and what we should do next.

## What we have done

1. A client enters a website. The system asks a few questions, researches the business, and writes a blueprint: score, problems, opportunities, services, timeline, and a PDF.
2. After the blueprint, the client can talk to the consultant by text or voice, or ask TechTivAI to build the work. That request goes to the admin.
3. The client portal is Home, Blueprints, Consultant, and Messages. The admin home is three jobs: reply to new leads, fix failed analyses, and scope open build requests.
4. The first blueprint is free and fully open. Stripe test mode is connected for the next website. An admin can turn that charge on or off.
5. If the worker stops, the screen says research paused after five minutes and offers Try again. It no longer spins for hours.

## How an analysis works

1. Client enters the business name, website, and social links.
2. The system reads the public site and asks a few questions.
3. Client confirms the brief. Deep research starts here.
4. First blueprint for that email is free. Research starts at once.
5. The next new website, when payments are on, is a $5 checkout. Research starts only after Stripe confirms it.
6. The worker crawls the site, checks the public footprint, audits the technology, looks at competitors, writes the strategy, prices the work from fixed rules, and builds the PDF.
7. The client watches each step. A finished step shows a check. Only the current step shows a spinner.
8. The blueprint opens in the portal. The client can download the PDF, talk to the consultant, or ask us to build it.
9. The owner can make the blueprint public. Someone else can open that report, or run their own research.

## How payment works

1. Payments are off until an admin turns them on. Off means no pay step. Analyses start as they do today.
2. On means the first blueprint stays free. The next new website asks for $5 after the questions, before deep research.
3. A signed-in user is not asked to type an email. Checkout returns them to the same conversation, then research starts.
4. Stripe sets the price. A repeated notice cannot start a second run.
5. This has been tested in Stripe’s sandbox. A demo payment succeeded and the paid analysis started.
6. Growth, Scale, and the custom build quote are still “talk to us.” They are not checkout.
7. Live keys are not on the public site yet. Test keys must not be used in production.

## Recommendations

1. **Keep $5 as one or two extra analyses, not the whole product.** $5 pays for the next website research only. It does not include the build, the monthly service, or unlimited use. Say that on the checkout screen so a client does not think $5 buys the full TechTivAI system.

2. **Research the market, then turn the blueprint into a system that does the work.** Today the product analyzes a business and gives a report to read. It does not run the fix. Before the next build, study products in this space and choose the features that move a client from “read the plan” to “the problem is being handled.” That is the step that makes this a production SaaS, not a report tool.

3. **Add monthly plans for ongoing use.** A plan should include talking to the consultant about the services in that blueprint, and a set number of extra analyses. Agencies need more credits so they can run analyses for their own clients. Build this as a monthly subscription on the same Stripe customer as the $5 charge. Do not replace the $5 entry.

4. **Turn live billing on only after one real $5 test.** Live key, live webhook, live price, admin switch on. Leave the switch off until that test passes.

5. **Alert the team when the worker stops.** The screen now pauses a quiet run. A failed job should also notify the admin. A client retry does not help if the worker is down.

6. **Leave the phone app and phone-number calls for later.** Voice today is in the browser, on the blueprint. A mobile app and a phone line are a separate product.

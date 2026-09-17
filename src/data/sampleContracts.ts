import { DocumentAnalysis, ComparisonResult } from '../types';

export const SAMPLE_LEASE_DOCUMENT: DocumentAnalysis = {
  id: 'lease-2026-sample',
  title: 'Standard Residential Lease Agreement — Apt 4B',
  docType: 'lease',
  detectedType: 'Residential Lease Agreement',
  summary: 'A 12-month residential apartment lease for Unit 4B at 142 Elmwood Ave. The lease contains 8 core sections. While base rent ($2,450/mo) and security deposit terms are standard, there are three high-attention clauses: an aggressive 90-day automatic renewal trap, an onerous early termination penalty accelerating the full balance of the year, and an unusually short 12-hour landlord entry window.',
  clauses: [
    {
      id: 'c1',
      number: 'Section 1',
      title: 'Premises, Term & Monthly Rent',
      originalText: 'Landlord hereby leases to Tenant, and Tenant leases from Landlord, Unit 4B located at 142 Elmwood Avenue, for a fixed term of twelve (12) months commencing on October 1, 2026 and expiring on September 30, 2027. Monthly base rent shall be $2,450.00, payable in advance on or before the first (1st) day of each calendar month via the Landlord’s online portal. Any payment received after 11:59 PM on the fifth (5th) day of the month shall be assessed a late fee of $125.00 plus $15.00 per day thereafter until paid in full.',
      simplifiedText: 'You agree to rent Apartment 4B for one full year starting October 1, 2026. Rent is $2,450 each month, due on the 1st. You have until the 5th to pay before a $125 late fee kicks in, plus $15 every day you are late.',
      preciseText: 'Lease establishes a fixed 12-month tenancy from Oct 1, 2026 to Sept 30, 2027 at $2,450/month due on the 1st. A 4-day grace period applies; delinquent sums after the 5th incur a $125 administrative late charge plus a per diem penalty of $15/day.',
      jargonTerms: [
        { term: 'fixed term', definition: 'A lease with a specified start and end date that cannot be ended early without cause or penalty.' },
        { term: 'per diem', definition: 'A daily charge assessed for each subsequent day an obligation remains unpaid.' },
        { term: 'in advance', definition: 'Payment must be received before the month begins, not at the end of the month.' }
      ],
      tag: 'standard',
      tagReason: 'Rent amount, monthly due date, and 5-day grace period are standard residential lease terms.',
      page: 1,
      consequenceWalkthrough: 'If your rent payment clears on the 6th rather than the 5th, your account will be billed $140.00 ($125 flat fee + $15 for the 6th day). Continued non-payment past 14 days permits the landlord to issue a formal Notice to Cure or Quit under state statutory timelines.'
    },
    {
      id: 'c2',
      number: 'Section 2',
      title: 'Security Deposit & Condition at Surrender',
      originalText: 'Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $2,450.00 as security for the faithful performance of all covenants herein. Said deposit shall be held in an escrow account. Within thirty (30) days following surrender of the Premises, Landlord shall return the deposit less lawful deductions for damage exceeding normal wear and tear, provided Tenant has conducted a documented joint move-out inspection and surrendered all keys and access fobs.',
      simplifiedText: 'You pay a $2,450 security deposit upfront. The landlord must hold it in an escrow account and return it within 30 days after you move out, minus any actual damages beyond everyday wear and tear. You must do a joint walkthrough before leaving.',
      preciseText: 'Requires an upfront security deposit equivalent to one month’s rent ($2,450) held in escrow. Landlord must provide an itemized accounting and return net proceeds within 30 days of surrender, conditioned upon joint move-out inspection.',
      jargonTerms: [
        { term: 'escrow account', definition: 'A separate, dedicated bank account where funds are protected and not mixed with personal or operating money.' },
        { term: 'surrender', definition: 'The formal return of physical possession and keys of the property to the landlord.' },
        { term: 'normal wear and tear', definition: 'Expected minor deterioration resulting from everyday living, which landlords legally cannot deduct.' }
      ],
      tag: 'standard',
      tagReason: 'One month deposit and 30-day return period strictly match jurisdictional statutory baselines.',
      page: 1,
      consequenceWalkthrough: 'If you move out leaving nail holes or minor paint scuffs, that is normal wear and tear; if there is carpet burning or broken tiles, the landlord must provide itemized receipts within 30 days before deducting from your $2,450.'
    },
    {
      id: 'c3',
      number: 'Section 3',
      title: 'Automatic Lease Renewal & Escalation Notice',
      originalText: 'This Agreement shall automatically renew for a successive twelve (12) month term unless Tenant delivers written notice of intention to vacate at least ninety (90) days prior to the expiration date. In the event of such automatic renewal, the Monthly Base Rent shall escalate by ten percent (10.0%) effective on the renewal commencement date. Notice delivered by electronic mail or text message shall be void; notice must be sent via Certified Mail with Return Receipt Requested.',
      simplifiedText: 'Warning: If you want to move out when your 1-year lease ends, you must send a certified postal letter at least 90 days in advance (by July 2, 2027). If you miss this deadline by even one day, you are automatically locked in for another full year with a 10% rent increase ($2,695/mo). Email notice is explicitly declared invalid.',
      preciseText: 'Evergreen automatic renewal clause mandating a restrictive 90-day pre-expiration notice window via certified mail. Failure to strictly comply binds the Tenant to a full 12-month successor tenancy subject to a non-negotiable 10% rent escalation.',
      jargonTerms: [
        { term: 'automatic renewal', definition: 'A clause that extends a contract automatically unless one party gives advance notice to stop it.' },
        { term: 'escalate', definition: 'An automatic, contractual increase in the rent amount upon term transition.' },
        { term: 'certified mail', definition: 'A postal service that provides the sender with legal proof of mailing and delivery confirmation.' }
      ],
      tag: 'high-attention',
      tagReason: '90-day certified mail notice window with automatic 12-month lock-in and mandatory 10% rent hike is an aggressive tenant lock-in trap.',
      suggestedNegotiationStrategy: 'Request reducing the notice window from 90 days to 30 or 60 days, permit notice via email rather than certified mail, and replace the automatic 10% rent hike with a standard month-to-month transition at prevailing market or CPI rate.',
      suggestedReplacementText: 'Tenant may terminate this Agreement at the expiration of the initial Term by providing written notice to Landlord via email or standard mail at least thirty (30) days prior to the expiration date. In the event no notice is delivered, this tenancy shall transition to a month-to-month tenancy at the existing rental rate, terminable by either party upon thirty (30) days written notice.',
      page: 2,
      consequenceWalkthrough: 'If you notify the landlord on July 10, 2027 that you plan to move out on September 30, you will be 8 days past the 90-day cutoff. The landlord can legally claim the lease automatically renewed for another 12 months at $2,695/month, leaving you liable for over $32,000 in rent unless an agreement is reached.'
    },
    {
      id: 'c4',
      number: 'Section 4',
      title: 'Landlord Right of Entry & Inspection',
      originalText: 'Landlord, its agents, and authorized contractors shall have the right to enter the Premises at any time during ordinary business hours upon giving twelve (12) hours prior verbal or electronic notice to inspect the premises, perform maintenance, or show the premises to prospective buyers, mortgagees, or tenants. In cases of suspected emergency, no notice shall be required.',
      simplifiedText: 'The landlord only needs to give you 12 hours notice before entering your apartment for inspections, repairs, or showing it to strangers. Most standard leases require 24 to 48 hours written notice.',
      preciseText: 'Authorizes landlord inspection and non-emergency showings with only 12 hours informal notice, abridging the customary 24-hour quiet enjoyment standard recognized in residential tenancy law.',
      jargonTerms: [
        { term: 'covenant of quiet enjoyment', definition: 'A tenant’s fundamental legal right to occupy the rental property peacefully without unwarranted landlord intrusion.' },
        { term: 'prospective', definition: 'Potential future buyers or renters inspecting the apartment while you still live there.' }
      ],
      tag: 'unusual',
      tagReason: '12-hour notice for routine entry is below the customary 24-48 hour statutory benchmark.',
      suggestedNegotiationStrategy: 'Propose replacing the 12-hour informal notice with standard 24 hours advance written or electronic notice during business hours, and clarify that immediate entry is strictly reserved for genuine life- or property-threatening emergencies.',
      suggestedReplacementText: 'Landlord, its agents, and authorized contractors shall have the right to enter the Premises during ordinary business hours (9:00 AM to 5:00 PM, Monday through Friday) upon providing at least twenty-four (24) hours prior written or electronic notice to inspect or perform maintenance. In cases of bona fide emergency threatening life or severe property damage, Landlord may enter without prior notice.',
      page: 2,
      consequenceWalkthrough: 'The landlord can send a text at 9:00 PM saying they will enter your bedroom tomorrow morning at 9:00 AM with a contractor, and you cannot refuse entry under this text.'
    },
    {
      id: 'c5',
      number: 'Section 5',
      title: 'Assignment, Subletting & Additional Occupants',
      originalText: 'Tenant shall not assign this Agreement, sublet all or any portion of the Premises, or license any guest to occupy the Premises for more than seven (7) consecutive days without Landlord’s prior written consent, which consent may be withheld in Landlord’s sole, absolute, and unreviewable discretion. Any unauthorized subletting, including listing on short-term rental platforms, shall trigger immediate forfeiture of the security deposit and constitute an incurable material breach.',
      simplifiedText: 'You cannot sublet your apartment, rent it out on Airbnb, or have any houseguest stay longer than 7 days in a row without the landlord’s written permission. The landlord can say "no" for any reason, and violating this will forfeit your deposit and risk eviction.',
      preciseText: 'Absolute restraint on assignment, sublease, and guest stays exceeding 7 consecutive days. Grants landlord unreviewable discretion and specifies automatic forfeiture of the entire deposit as a liquidated penalty for unauthorized occupancy.',
      jargonTerms: [
        { term: 'sole discretion', definition: 'The landlord has total freedom to approve or deny without needing a fair or reasonable justification.' },
        { term: 'material breach', definition: 'A major violation of contract terms that gives the other party legal grounds to terminate the agreement and sue.' },
        { term: 'forfeiture', definition: 'Losing your legal right to property or money as a penalty for breaking a rule.' }
      ],
      tag: 'unusual',
      tagReason: 'Complete prohibition on subletting with "unreviewable discretion" rather than "consent not unreasonably withheld."',
      suggestedNegotiationStrategy: 'Request changing "unreviewable discretion" to standard "consent not to be unreasonably withheld or delayed," allowing qualified subtenants who meet standard credit and reference checks.',
      suggestedReplacementText: 'Tenant may assign this Agreement or sublet the Premises with Landlord’s prior written consent, which consent shall not be unreasonably withheld, conditioned, or delayed, provided the prospective subtenant meets Landlord’s standard credit and background criteria.',
      page: 3,
      consequenceWalkthrough: 'If you need to leave the city for 3 months for summer work, you cannot find a replacement tenant to cover your rent unless the landlord voluntarily agrees, and they can reject qualified credit-score applicants without explanation.'
    },
    {
      id: 'c6',
      number: 'Section 6',
      title: 'Early Termination & Accelerated Liquidated Damages',
      originalText: 'Should Tenant vacate or surrender the Premises prior to the expiration of the full Term without Landlord’s express written release, Tenant shall remain strictly liable for the acceleration of all rent due through the remainder of the Term. Tenant shall furthermore pay a liquidated re-leasing fee equal to two (2) months’ rent. Landlord shall have no obligation to mitigate damages or seek replacement occupants prior to initiating collection proceedings.',
      simplifiedText: 'Major danger: If you need to break your lease early (e.g., job relocation or family emergency), you are on the hook for EVERY remaining month of the year plus a 2-month penalty fee. It also tries to exempt the landlord from looking for a new tenant to reduce your bill.',
      preciseText: 'Unenforceable penalty clause purporting to accelerate full unaccrued rent for the entire term while simultaneously disclaiming the landlord’s mandatory statutory duty to mitigate damages upon abandonment.',
      jargonTerms: [
        { term: 'acceleration of rent', definition: 'A clause requiring immediate payment of all future rent remaining on the contract term.' },
        { term: 'duty to mitigate', definition: 'A landlord’s legal obligation to make reasonable efforts to re-rent the vacated unit to minimize losses.' },
        { term: 'liquidated damages', definition: 'A pre-determined cash penalty for breaching a contract.' }
      ],
      tag: 'high-attention',
      tagReason: 'Disclaimer of duty to mitigate damages combined with rent acceleration is predatory and frequently held void by housing courts.',
      suggestedNegotiationStrategy: 'Advise striking the rent acceleration and disclaimer of mitigation, replacing both with an early lease termination buyout option of 60 days notice plus a 2-month buyout fee with full release of liability.',
      suggestedReplacementText: 'In the event Tenant elects to terminate this Agreement prior to the expiration of the Term, Tenant may do so by providing sixty (60) days prior written notice and paying an early termination fee equal to two (2) months’ rent. Upon payment of such fee and surrender of the Premises, Tenant shall be fully released from all future obligations under this Lease. Landlord shall maintain its statutory duty to make commercially reasonable efforts to mitigate damages.',
      page: 3,
      consequenceWalkthrough: 'If you vacate in Month 4 due to job loss, the landlord could invoice you for 8 remaining months ($19,600) + 2 months penalty ($4,900) = $24,500 total, while leaving the apartment vacant. While many state laws mandate landlords must mitigate damages, signing this gives the landlord leverage to send aggressive collections.'
    },
    {
      id: 'c7',
      number: 'Section 7',
      title: 'Maintenance, Repairs & Tenant Deductible',
      originalText: 'Tenant shall keep the Premises in clean, sanitary order. Tenant shall be financially responsible for the first $100.00 of any plumbing, electrical, or appliance repair per incident, regardless of fault, unless caused by the gross negligence of Landlord. Landlord shall be responsible for structural repairs, roofing, and common areas.',
      simplifiedText: 'You have to pay the first $100 for any appliance or plumbing repair every single time, even if the refrigerator or pipes broke through no fault of your own.',
      preciseText: 'Imposes a $100 tenant deductible per service call for internal fixtures and appliances regardless of fault, shifting routine warranty of habitability maintenance costs onto the lessee.',
      jargonTerms: [
        { term: 'warranty of habitability', definition: 'The landlord’s non-waivable legal duty to provide safe, clean, and functioning heating, water, and essential fixtures.' },
        { term: 'gross negligence', definition: 'Extreme carelessness showing a total disregard for the safety or rights of others.' }
      ],
      tag: 'unusual',
      tagReason: '$100 tenant deductible on routine repairs shifts statutory habitability maintenance costs to the renter.',
      suggestedNegotiationStrategy: 'Request removing the $100 repair deductible entirely, reaffirming that Landlord is responsible for maintenance of major appliances and plumbing unless repairs are caused by Tenant negligence or deliberate misuse.',
      suggestedReplacementText: 'Landlord shall be responsible for all repairs and maintenance to plumbing, electrical, heating, and major appliances provided within the Premises at Landlord’s expense, except where repairs are necessitated by Tenant’s negligence or willful misuse. Tenant shall not be charged a deductible or fee for routine maintenance calls.',
      page: 4,
      consequenceWalkthrough: 'If the 10-year-old dishwasher stops draining or the bathroom faucet seal leaks, you must pay $100 toward the plumber before the landlord will authorize the fix.'
    },
    {
      id: 'c8',
      number: 'Section 8',
      title: 'Dispute Resolution & Attorney’s Fees',
      originalText: 'In any legal action or arbitration arising out of this Agreement, the prevailing party shall be entitled to recover reasonable attorney’s fees, expert witness fees, and court costs from the non-prevailing party. Tenant expressly waives right to jury trial and agrees that jurisdiction shall lie exclusively in the Municipal Housing Court of the County.',
      simplifiedText: 'If you and the landlord go to court, whoever wins gets their lawyer fees and court costs paid by the loser. Both sides waive the right to a jury trial.',
      preciseText: 'Bilateral fee-shifting provision awarding attorney’s fees to the prevailing litigant, coupled with a mandatory jury trial waiver and explicit venue selection clause.',
      jargonTerms: [
        { term: 'prevailing party', definition: 'The party that successfully wins the lawsuit or arbitration.' },
        { term: 'fee-shifting', definition: 'A rule forcing the loser of a lawsuit to pay the winner’s legal expenses.' },
        { term: 'jury trial waiver', definition: 'Giving up the constitutional right to have a jury hear the case, leaving the decision to a single judge.' }
      ],
      tag: 'standard',
      tagReason: 'Mutual prevailing party attorney fee clause is balanced and standard in residential leases.',
      page: 4,
      consequenceWalkthrough: 'If you take the landlord to court to recover your $2,450 deposit and win, the landlord must pay your attorney fees; if the court rules you were in the wrong, you must pay their attorney.'
    }
  ],
  timeline: [
    {
      id: 't1',
      dateOrTrigger: 'October 1, 2026',
      title: 'Tenancy Commencement & Move-In',
      description: 'First month rent ($2,450) and security deposit ($2,450) due in full prior to key pickup.',
      party: 'Tenant',
      category: 'deadline',
      isoDate: '2026-10-01'
    },
    {
      id: 't2',
      dateOrTrigger: 'Monthly (1st-5th day)',
      title: 'Monthly Rent & Grace Period',
      description: 'Rent ($2,450) due on the 1st. $125 late penalty applied on the 6th at 12:00 AM, plus $15/day.',
      party: 'Tenant',
      category: 'payment'
    },
    {
      id: 't3',
      dateOrTrigger: 'July 2, 2027 (90 Days Before Expiration)',
      title: 'CRITICAL: Non-Renewal Notice Deadline',
      description: 'Must deliver written notice via Certified Mail to terminate. If missed, lease automatically renews for 12 months at $2,695/mo.',
      party: 'Tenant',
      category: 'renewal',
      isoDate: '2027-07-02'
    },
    {
      id: 't4',
      dateOrTrigger: 'September 30, 2027',
      title: 'Lease Expiration & Move-Out Walkthrough',
      description: 'Joint move-out inspection and complete surrender of keys/fobs to Landlord.',
      party: 'Both Parties',
      category: 'deadline',
      isoDate: '2027-09-30'
    },
    {
      id: 't5',
      dateOrTrigger: 'October 30, 2027 (30 Days Post-Surrender)',
      title: 'Security Deposit Itemization & Return',
      description: 'Landlord must provide itemized statement and return balance of $2,450 escrow deposit.',
      party: 'Landlord',
      category: 'deadline',
      isoDate: '2027-10-30'
    }
  ],
  questionsChecklist: [
    {
      id: 'q1',
      question: 'Can Section 3 (Automatic Renewal) be modified from 90 days certified mail to 30 or 60 days via standard email?',
      whyAsk: '90 days is three months before move-out—most renters have not secured their next home by then. Missing it locks you into a $32,000 obligation.',
      relevantClauseId: 'c3',
      clauseTitle: 'Section 3: Automatic Lease Renewal & Escalation Notice'
    },
    {
      id: 'q2',
      question: 'Will the landlord agree to strike the disclaimer of duty to mitigate in Section 6?',
      whyAsk: 'Under state law, landlords are almost universally required to seek a replacement tenant if you must move out. This clause tries to waive your rights.',
      relevantClauseId: 'c6',
      clauseTitle: 'Section 6: Early Termination & Accelerated Liquidated Damages'
    },
    {
      id: 'q3',
      question: 'Can the entry notice window in Section 4 be increased to 24 hours written notice?',
      whyAsk: '12 hours means the landlord can notify you at night and enter your home the following morning.',
      relevantClauseId: 'c4',
      clauseTitle: 'Section 4: Landlord Right of Entry & Inspection'
    },
    {
      id: 'q4',
      question: 'Can Section 7 be amended so the $100 deductible only applies if damage is caused by tenant misuse?',
      whyAsk: 'You should not pay $100 for natural aging of water heaters, refrigerator motors, or electrical outlets.',
      relevantClauseId: 'c7',
      clauseTitle: 'Section 7: Maintenance, Repairs & Tenant Deductible'
    }
  ],
  lawyerBrief: {
    summary: 'Client is reviewing a 12-month residential apartment lease for $2,450/month. The agreement contains high-risk automatic renewal and penalty provisions that appear contrary to consumer protection standards in residential leasing.',
    flaggedClauses: [
      {
        clauseId: 'c3',
        clauseTitle: 'Section 3: Automatic Renewal (90-Day Certified Mail Notice)',
        tag: 'high-attention',
        concern: 'Unusually long 90-day certified mail notice threshold with 10% rent escalation trap. In many jurisdictions, evergreen clauses require separate written warning 15-30 days prior to notice deadline to remain enforceable.',
        paralegalNote: 'Recommend requesting reduction to 30 or 60 days with email delivery permitted.'
      },
      {
        clauseId: 'c6',
        clauseTitle: 'Section 6: Early Termination (Rent Acceleration & No Duty to Mitigate)',
        tag: 'high-attention',
        concern: 'Liquidated damages clause accelerating all future rent plus 2 months fee while disclaiming duty to mitigate. Likely unconscionable and unenforceable under state statutory habitability & contract laws.',
        paralegalNote: 'Advise client to propose standard 2-month early termination buyout fee with full mutual release.'
      },
      {
        clauseId: 'c4',
        clauseTitle: 'Section 4: Landlord Entry (12-Hour Notice)',
        tag: 'unusual',
        concern: 'Sub-24-hour notice standard infringes on tenant covenant of quiet enjoyment.',
        paralegalNote: 'Standard statutory notice is 24 or 48 hours for non-emergency inspections.'
      },
      {
        clauseId: 'c7',
        clauseTitle: 'Section 7: Maintenance ($100 Repair Deductible)',
        tag: 'unusual',
        concern: 'Cost-shifting of landlord repair obligations onto tenant undermines statutory warranty of habitability.',
        paralegalNote: 'Suggest striking or specifying tenant is only liable for damage caused by deliberate fault or gross negligence.'
      }
    ],
    openQuestions: [
      'Is the 90-day automatic renewal clause legally enforceable under local state tenancy disclosure statutes?',
      'Can the landlord be compelled to accept an early-termination buyout cap of 60 days rent?',
      'Does local municipal code require interest to be paid annually on the $2,450 security deposit held in escrow?'
    ],
    missingProvisions: [
      'No clause outlining Landlord’s duty to deliver possession on the commencement date or tenant remedy if unit is unavailable.',
      'No explicit disclosure regarding lead-based paint or radon hazards (statutorily required for pre-1978 properties).',
      'No reasonable accommodation clause for assistance animals under Fair Housing Act.'
    ],
    disclaimer: 'This paralegal preparatory brief organizes document facts, highlighted clauses, and initial observations for discussion with a licensed attorney. It does not constitute formal legal counsel, representation, or prediction of case outcomes.'
  }
};

export const SAMPLE_EMPLOYMENT_DOCUMENT: DocumentAnalysis = {
  id: 'employment-offer-sample',
  title: 'Executive Employment Offer & Proprietary Rights Agreement',
  docType: 'employment',
  detectedType: 'Employment Offer & Invention Assignment',
  summary: 'A full-time employment agreement for a Senior Software Architect role. Base compensation ($185,000) and at-will employment terms are customary. However, the document contains an overreaching Intellectual Property assignment claiming ownership over projects created on personal time, and a 12-month post-employment non-compete covenant.',
  clauses: [
    {
      id: 'emp-1',
      number: 'Section 1',
      title: 'Position, Compensation & At-Will Status',
      originalText: 'Employee shall serve as Senior Software Architect reporting to the VP of Engineering. Annual base salary shall be $185,000.00, paid semi-monthly in accordance with standard payroll procedures. Employment is at-will, meaning either Employee or Company may terminate the employment relationship at any time, with or without cause and with or without advance notice.',
      simplifiedText: 'You will work as Senior Software Architect for $185,000 per year. Employment is "at-will," which means either you or the company can end the job at any time for any reason (or no reason), without advance notice.',
      preciseText: 'Establishes title and $185,000 annualized base compensation under an at-will tenancy, preserving bilateral termination rights without requirement of cause or severance accrual.',
      jargonTerms: [
        { term: 'at-will employment', definition: 'An employment doctrine where either party can terminate the relationship at any time without legal liability, unless violating statutory discrimination or whistleblower laws.' },
        { term: 'semi-monthly', definition: 'Paid twice per month (typically the 15th and last day of the month), totaling 24 paychecks per year.' }
      ],
      tag: 'standard',
      tagReason: 'Standard at-will employment and salary cadence in the technology sector.',
      page: 1,
      consequenceWalkthrough: 'The company can eliminate the position tomorrow without paying severance unless you negotiate a separate severance schedule; conversely, you can resign on 24 hours notice without breach of contract.'
    },
    {
      id: 'emp-2',
      number: 'Section 2',
      title: 'Assignment of Inventions & Personal Works',
      originalText: 'Employee hereby assigns to Company all right, title, and interest in and to any and all inventions, designs, software code, algorithms, patents, and copyrightable works created, authored, or conceived by Employee during the period of employment, whether or not developed on Company premises, whether or not created during working hours, and whether or not using Company equipment, if such works relate in any manner to Company’s current business or reasonably anticipated research and development.',
      simplifiedText: 'Warning: The company claims ownership of software, apps, or designs you build in your spare time at home on your own computer on weekends, if it touches anything the company does or might explore in the future.',
      preciseText: 'Broad assignment of intellectual property capturing works developed outside working hours and without company equipment if related to current or speculative future business vectors.',
      jargonTerms: [
        { term: 'assignment', definition: 'A permanent, irrevocable transfer of ownership rights from one person or company to another.' },
        { term: 'reasonably anticipated', definition: 'Vague legal standard that companies use to claim ownership over areas they might research in the future.' }
      ],
      tag: 'high-attention',
      tagReason: 'Assignment of personal inventions created off-hours without company resources exceeds statutory protections in states like CA, WA, and NY.',
      suggestedNegotiationStrategy: 'Add a statutory personal inventions carveout expressly excluding software or projects created entirely on personal time using personal equipment that do not incorporate company proprietary code or relate directly to company business.',
      suggestedReplacementText: 'Employee assigns all inventions conceived during working hours or utilizing Company resources, equipment, or confidential trade secrets. This assignment shall not apply to any invention or software created entirely on Employee’s own personal time without using Company equipment, supplies, or trade secrets, and which does not relate directly to the Company’s actual commercial products or verified research and development.',
      page: 2,
      consequenceWalkthrough: 'If you build an iOS utility app on your personal laptop on Sunday, and the company later starts a mobile team, the company could claim legal ownership of your app and demand all revenues.'
    },
    {
      id: 'emp-3',
      number: 'Section 3',
      title: 'Post-Employment Non-Competition Covenant',
      originalText: 'For a period of twelve (12) months following separation from Company for any reason, Employee shall not directly or indirectly engage in, perform services for, consult with, or hold an equity interest in any business or enterprise that competes with the products or services offered by Company anywhere in North America or the European Union.',
      simplifiedText: 'Severe restriction: For 1 full year after leaving, you are banned from working for any competitor or consulting in your industry across North America and Europe. In many places (like California or under FTC rules), broad non-competes are void or unenforceable, but signing this invites legal intimidation.',
      preciseText: 'Restrictive post-termination non-competition agreement encompassing a 12-month temporal scope and broad international geographic territory without geographic limitation or garden leave compensation.',
      jargonTerms: [
        { term: 'non-compete covenant', definition: 'A contractual promise not to work in the same field or for a competitor after leaving your employer.' },
        { term: 'garden leave', definition: 'A period during which an employee is paid their full salary while staying home and prevented from working for a competitor.' }
      ],
      tag: 'high-attention',
      tagReason: '12-month global non-compete without garden leave pay is highly restrictive and unenforceable in numerous states.',
      suggestedNegotiationStrategy: 'Strike the broad non-competition covenant and replace it with strong customer and employee non-solicitation language, or restrict it strictly to direct competitors within a 25-mile radius with paid garden leave.',
      suggestedReplacementText: 'For a period of six (6) months following termination of employment, Employee shall not directly solicit the business of any client with whom Employee had personal contact during the final twelve (12) months of employment. Nothing herein shall prohibit Employee from accepting employment with any company or providing software engineering services, provided Employee complies strictly with the confidentiality obligations of Section 4.',
      page: 3,
      consequenceWalkthrough: 'If you resign to take a higher paying job at another tech firm, the company’s lawyers could send a cease-and-desist letter to your new employer threatening a lawsuit, potentially costing you the new offer.'
    },
    {
      id: 'emp-4',
      number: 'Section 4',
      title: 'Confidentiality & Non-Disclosure',
      originalText: 'Employee agrees to hold in strictest confidence all proprietary information, trade secrets, customer lists, pricing algorithms, and technical data belonging to Company. This obligation survives termination of employment for a duration of five (5) years, except for trade secrets, which shall remain protected in perpetuity.',
      simplifiedText: 'You must keep company business secrets and client lists private. The secrecy obligation lasts for 5 years, and technical trade secrets stay protected forever.',
      preciseText: 'Standard non-disclosure provision with a 5-year sunset on general proprietary data and perpetual protection for qualifying statutory trade secrets.',
      jargonTerms: [
        { term: 'trade secret', definition: 'Valuable information not known to the public that gives a business a competitive advantage (e.g., proprietary algorithms or recipes).' },
        { term: 'in perpetuity', definition: 'Forever; having no end date.' }
      ],
      tag: 'standard',
      tagReason: '5-year confidentiality with perpetual trade secret protection is standard tech industry practice.',
      page: 3,
      consequenceWalkthrough: 'You cannot bring the company’s internal code repositories, client email lists, or non-public financial models to your next job.'
    }
  ],
  timeline: [
    {
      id: 'emp-t1',
      dateOrTrigger: 'Start Date (Nov 1, 2026)',
      title: 'First Day of Employment',
      description: 'Completion of I-9 verification, benefits election, and schedule of pre-existing inventions exclusion.',
      party: 'Employee',
      category: 'deadline'
    },
    {
      id: 'emp-t2',
      dateOrTrigger: '15th & Last Day Monthly',
      title: 'Bi-Monthly Payroll Disbursal',
      description: 'Gross salary payment of $7,708.33 per pay period.',
      party: 'Company',
      category: 'payment'
    },
    {
      id: 'emp-t3',
      dateOrTrigger: '12 Months Post-Separation',
      title: 'Non-Compete Expiration Window',
      description: 'Expiration of the 12-month restrictive covenant barring employment at competing firms.',
      party: 'Employee',
      category: 'renewal'
    }
  ],
  questionsChecklist: [
    {
      id: 'eq1',
      question: 'Can Section 2 be clarified with a specific "Exhibit A" listing my prior inventions and exempting personal projects built off-hours?',
      whyAsk: 'Without explicit carveouts, the company may assert ownership over your independent open-source contributions or personal hobby apps.',
      relevantClauseId: 'emp-2',
      clauseTitle: 'Section 2: Assignment of Inventions & Personal Works'
    },
    {
      id: 'eq2',
      question: 'Can the 12-month non-compete in Section 3 be removed or replaced with a non-solicitation of clients clause?',
      whyAsk: 'Broad non-competes restrict your livelihood and mobility in the tech market.',
      relevantClauseId: 'emp-3',
      clauseTitle: 'Section 3: Post-Employment Non-Competition Covenant'
    }
  ],
  lawyerBrief: {
    summary: 'Client received an offer for Senior Software Architect ($185,000). The agreement has significant overreach in IP assignment regarding off-duty works, and includes an aggressive 1-year non-compete covenant.',
    flaggedClauses: [
      {
        clauseId: 'emp-2',
        clauseTitle: 'Section 2: IP Assignment',
        tag: 'high-attention',
        concern: 'Purports to assign all inventions created during term of employment regardless of whether company equipment/premises were used. Directly conflicts with California Labor Code § 2870 or similar state carve-outs.',
        paralegalNote: 'Add standard statutory carve-out language for works created entirely on employee own time without company assets.'
      },
      {
        clauseId: 'emp-3',
        clauseTitle: 'Section 3: 12-Month Non-Compete',
        tag: 'high-attention',
        concern: 'Broad nationwide/EU non-compete without consideration or severance payment.',
        paralegalNote: 'Determine state governing law; if CA, non-compete is void and unlawful to include under SB 699/AB 1076.'
      }
    ],
    openQuestions: [
      'What state law governs this contract, and does that state permit non-compete agreements for tech workers?',
      'Can we attach a schedule of pre-existing patents and code repositories to permanently shield client existing IP?'
    ],
    missingProvisions: [
      'No severance provision or change-in-control protection clause.',
      'No indemnification clause protecting the employee against third-party lawsuits while acting in scope of duties.'
    ],
    disclaimer: 'This document is prepared for preliminary attorney consultation and does not constitute formal legal advice.'
  }
};

export const SAMPLE_VENDOR_DOCUMENT: DocumentAnalysis = {
  id: 'vendor-msa-sample',
  title: 'Master Professional Services Agreement — Vendor Delivery & SOW',
  docType: 'vendor',
  detectedType: 'Master Services Agreement & SOW',
  summary: 'A commercial services agreement with Apex Software Solutions for cloud platform engineering. Contains explicit milestone deadlines, a $1,000/day delay penalty mechanism, a 14-day cure and termination window for client recourse, and an aggressive vendor limitation of liability capping damages to 3 months of fees.',
  clauses: [
    {
      id: 'ven-1',
      number: 'Section 1',
      title: 'Services, Staffing & Work Standards',
      originalText: 'Vendor shall provide software engineering and systems integration services as set forth in each Statement of Work ("SOW"). Vendor warrants that all services will be executed in a professional, workmanlike manner conforming to prevailing industry benchmarks and by qualified personnel designated in Exhibit B.',
      simplifiedText: 'The vendor promises to build your software according to the project plan using qualified developers and following professional industry standards.',
      preciseText: 'Binds Vendor to perform professional software engineering services in strict accordance with the Statement of Work, warranting workmanlike execution and compliance with prevailing commercial standards.',
      jargonTerms: [
        { term: 'workmanlike manner', definition: 'A legal standard requiring work to be done with the normal care, skill, and quality expected of a competent professional in that field.' },
        { term: 'Statement of Work', definition: 'A binding contract attachment specifying deliverables, deadlines, and pricing for a specific project.' }
      ],
      tag: 'standard',
      tagReason: 'Standard commercial warranty of workmanlike services.',
      page: 1,
      consequenceWalkthrough: 'If the vendor assigns junior contractors with insufficient skills rather than the senior engineers named in Exhibit B, you can formally reject the staffing assignment as non-compliant.'
    },
    {
      id: 'ven-2',
      number: 'Section 2',
      title: 'Vendor Delivery Deadlines, Milestones & Liquidated Delay Damages',
      originalText: 'Vendor shall deliver each Project Milestone strictly on or before the Scheduled Delivery Date specified in Exhibit A. If Vendor fails to deliver complete, conforming deliverables by the applicable milestone deadline, Client shall be entitled to assess liquidated delay damages of $1,000.00 per calendar day of unexcused delay. If any milestone delay exceeds fourteen (14) business days, Client shall possess the immediate unilateral right to: (a) terminate this Agreement for material breach without penalty; (b) withhold all outstanding invoice balances; and (c) demand an immediate refund of all unearned prepaid deposits within ten (10) business days of notice.',
      simplifiedText: 'The vendor must hit every milestone deadline on time. If they are late without an agreed excuse, you can charge them a $1,000 penalty for every single day of delay. If they are more than 14 business days late, your recourse is clear: you can cancel the contract immediately for breach, withhold all pending payments, and get a full refund of any prepaid deposits within 10 days.',
      preciseText: 'Establishes firm time-of-the-essence delivery covenants with a stipulated $1,000/day liquidated damages penalty for unexcused delay. If milestone default exceeds 14 business days, Client possesses unilateral termination for cause, authorized payment withholding, and mandatory restitution of unearned retainers within 10 business days.',
      jargonTerms: [
        { term: 'liquidated delay damages', definition: 'A pre-set financial penalty assessed against a party for every day they fail to deliver on time.' },
        { term: 'unilateral right', definition: 'The authority of one party to take action or make a decision without needing the consent or permission of the other party.' },
        { term: 'material breach', definition: 'A major failure to perform an essential contract term that destroys the value of the deal and gives the innocent party immediate grounds to cancel and claim damages.' },
        { term: 'restitution', definition: 'Returning money or property to restore the innocent party to their financial position prior to the contract.' }
      ],
      tag: 'standard',
      tagReason: 'Clear milestone deadlines with daily delay penalties and client termination recourse for extended delays.',
      page: 1,
      consequenceWalkthrough: 'If the vendor misses Milestone 2 delivery by 6 calendar days, you have the legal right to deduct $6,000 from their milestone invoice. If they are 16 business days late, you can serve formal notice immediately terminating the contract for material breach, freeze all pending disbursements, and demand their bank return your $25,000 upfront retainer within 10 business days.'
    },
    {
      id: 'ven-3',
      number: 'Section 3',
      title: 'Client Inspection, Acceptance Testing & Defect Cure Window',
      originalText: 'Client shall have a period of ten (10) business days following delivery of each milestone to conduct acceptance testing. If deliverables fail to conform to technical specifications, Client shall deliver written notice specifying the defects. Vendor shall, at its sole cost and expense, repair, replace, or cure all identified defects within five (5) business days. Failure to cure within five (5) days constitutes a continuing milestone delay subject to Section 2 penalties.',
      simplifiedText: 'You get 10 business days to test each feature or deliverable when handed over. If you find bugs or errors, the vendor must fix them for free within 5 business days. If they don’t fix them within 5 days, the $1,000/day delay penalty starts ticking.',
      preciseText: 'Provides a 10-business-day inspection and verification window following milestone delivery. Requires Vendor to rectify non-conforming deliverables within a mandatory 5-day cure period at Vendor’s sole cost, after which per diem delay damages resume.',
      jargonTerms: [
        { term: 'acceptance testing', definition: 'Formal testing conducted by the client to verify that the delivered software meets agreed specifications before payment is approved.' },
        { term: 'cure period', definition: 'A designated grace window allowing a party in breach an opportunity to fix the error before facing penalties or termination.' }
      ],
      tag: 'standard',
      tagReason: 'Balanced 10-day client testing window with 5-day mandatory vendor cure.',
      page: 2,
      consequenceWalkthrough: 'If you test the portal and report 3 blocking bugs on Day 4, the vendor has until the 5th business day to deploy fixes without cost to you; if they take 8 days to fix, the extra 3 days count as delayed delivery under Section 2.'
    },
    {
      id: 'ven-4',
      number: 'Section 4',
      title: 'Limitation of Liability & Consequential Damages Waiver',
      originalText: 'In no event shall Vendor’s aggregate cumulative liability arising out of or related to this Agreement exceed the total fees actually paid by Client to Vendor in the three (3) months preceding the claim. Vendor disclaims all liability for indirect, incidental, special, punitive, or consequential damages, including lost revenue, lost profits, or business interruption, even if advised of the possibility thereof.',
      simplifiedText: 'Warning: If the vendor makes a critical error that brings down your website or loses company data, their maximum payout to you is capped at whatever you paid them in the past 3 months. They completely disclaim liability for any lost revenue or sales caused by their mistakes.',
      preciseText: 'Unilateral limitation of liability capping Vendor exposure to a trailing 3-month fee baseline, coupled with a broad waiver of consequential, indirect, and lost profit damages.',
      jargonTerms: [
        { term: 'limitation of liability', definition: 'A contractual cap on the maximum dollar amount one party can be forced to pay if they cause damages or break the contract.' },
        { term: 'consequential damages', definition: 'Indirect financial harm (such as lost sales, lost customers, or downtime costs) resulting from a breach.' }
      ],
      tag: 'high-attention',
      tagReason: 'Trailing 3-month liability cap is unusually short for software integration and leaves client vulnerable if vendor error causes significant commercial downtime.',
      suggestedNegotiationStrategy: 'Request increasing the liability cap to 12 months of fees or total contract value, and add mutual carve-outs for data security breaches, gross negligence, and confidentiality violations.',
      suggestedReplacementText: 'Except for breaches of Section 5 (Confidentiality & Data Protection) or damages resulting from gross negligence or willful misconduct, each party’s aggregate cumulative liability arising out of this Agreement shall be limited to the total fees paid or payable under the applicable SOW during the twelve (12) months preceding the incident giving rise to liability.',
      page: 3,
      consequenceWalkthrough: 'If a faulty vendor code deployment deletes customer databases and causes $150,000 in customer chargebacks, you can at most recover approximately 3 months of fees (e.g. $30,000) from the vendor, absorbing the remaining $120,000 loss internally.'
    }
  ],
  timeline: [
    {
      id: 'ven-t1',
      dateOrTrigger: 'October 15, 2026',
      title: 'Project Kickoff & Deposit',
      description: 'Initial deposit of $25,000 due upon execution of SOW #1.',
      party: 'Client',
      category: 'payment',
      isoDate: '2026-10-15'
    },
    {
      id: 'ven-t2',
      dateOrTrigger: 'November 15, 2026',
      title: 'Milestone 1 Delivery Deadline',
      description: 'Vendor delivery of Architecture Specs & Database Schema. Subject to $1,000/day delay liquidated damages.',
      party: 'Vendor',
      category: 'deadline',
      isoDate: '2026-11-15'
    },
    {
      id: 'ven-t3',
      dateOrTrigger: 'December 15, 2026',
      title: 'Milestone 2 Delivery Deadline',
      description: 'Core API & Auth integration. 10-day client testing window begins upon handover.',
      party: 'Vendor',
      category: 'deadline',
      isoDate: '2026-12-15'
    },
    {
      id: 'ven-t4',
      dateOrTrigger: '14 Business Days Post-Deadline',
      title: 'Client Termination for Cause Threshold',
      description: 'Client entitled to terminate SOW, withhold fees, and demand deposit refund if milestone is unexcused for 14+ days.',
      party: 'Client',
      category: 'penalty'
    }
  ],
  questionsChecklist: [
    {
      id: 'vq1',
      question: 'Can the Section 4 liability cap be increased from 3 months of fees to 12 months or the total contract value?',
      whyAsk: '3 months of fees is insufficient to cover potential security incidents or data breaches caused by vendor code.',
      relevantClauseId: 'ven-4',
      clauseTitle: 'Section 4: Limitation of Liability & Consequential Damages Waiver'
    },
    {
      id: 'vq2',
      question: 'Does the vendor maintain professional Errors & Omissions (E&O) and Cyber Liability insurance covering delay damages?',
      whyAsk: 'Liquidated damages and indemnities are only as good as the vendor insurance backing them up.',
      relevantClauseId: 'ven-2',
      clauseTitle: 'Section 2: Vendor Delivery Deadlines & Liquidated Delay Damages'
    }
  ],
  lawyerBrief: {
    summary: 'Client is negotiating a Master Services Agreement with a software vendor. While delivery deadlines and delay liquidated damages are clearly defined, Section 4 contains a restrictive 3-month liability cap that exposes the client to substantial unrecovered losses in the event of major vendor default.',
    flaggedClauses: [
      {
        clauseId: 'ven-4',
        clauseTitle: 'Section 4: Limitation of Liability (3-Month Cap)',
        tag: 'high-attention',
        concern: 'Liability is capped to trailing 3 months fees with a blanket disclaimer of lost revenue.',
        paralegalNote: 'Recommend establishing a super-cap (or carveout) for gross negligence, willful misconduct, and confidentiality/data security breaches at 12 months fees or $1,000,000.'
      }
    ],
    openQuestions: [
      'Should we include a specific Service Level Agreement (SLA) with uptime guarantees for hosted components?',
      'Can we require source code escrow if the vendor becomes insolvent?'
    ],
    missingProvisions: [
      'No explicit cyber liability insurance requirement clause.',
      'No IP infringement indemnification protecting Client against third-party patent or copyright claims.'
    ],
    disclaimer: 'This document is prepared for preliminary attorney consultation and does not constitute formal legal advice.'
  }
};

export const SAMPLE_COMPARISON_RESULT: ComparisonResult = {
  docAName: 'Original Residential Lease (2025 Standard)',
  docBName: 'Proposed Revised Lease (2026 Redline)',
  summary: 'Analysis of 4 material changes between the 2025 Original Agreement and the Landlord’s 2026 Redline. Three of the four changes strongly favor the Landlord by restricting notice timelines, shrinking late fee grace periods, and shifting repair costs. One change modestly favors the Tenant by allowing subletting with written consent.',
  changes: [
    {
      id: 'diff-1',
      section: 'Section 3: Renewal Notice Window',
      clauseTitle: 'Notice Period to Vacate',
      oldText: 'Tenant shall give at least sixty (60) days written notice prior to expiration of intention to vacate. Notice may be delivered by email or certified mail.',
      newText: 'Tenant must deliver written notice of intention to vacate at least ninety (90) days prior to expiration. Notice delivered by email shall be void; notice must be sent via Certified Mail.',
      favorsParty: 'Landlord',
      favorsBadgeColor: 'landlord',
      explanation: 'Extending notice from 60 to 90 days and banning email notices strictly favors the Landlord. It creates a 3-month advance trap where tenants who forget will automatically have their lease renewed.'
    },
    {
      id: 'diff-2',
      section: 'Section 1: Payment & Grace Period',
      clauseTitle: 'Late Fee Grace Period & Amount',
      oldText: 'Rent due on 1st. Payment received after 5th day incurs a $50 late charge.',
      newText: 'Rent due on 1st. Payment received after 2nd day incurs a $125 late fee plus $15 per day thereafter.',
      favorsParty: 'Landlord',
      favorsBadgeColor: 'landlord',
      explanation: 'Shrinking the grace period from 5 days to 2 days and increasing the fee from $50 to $125 + $15/day heavily favors the Landlord. If the 1st is a bank holiday, tenant faces immediate penalties.'
    },
    {
      id: 'diff-3',
      section: 'Section 7: Repairs & Deductible',
      clauseTitle: 'Maintenance Responsibility & Repair Deductible',
      oldText: 'Landlord shall be responsible for all repairs to plumbing, heating, electrical systems, and major appliances, unless caused by tenant negligence.',
      newText: 'Tenant shall be financially responsible for the first $100.00 of any plumbing, electrical, or appliance repair per incident, regardless of fault.',
      favorsParty: 'Landlord',
      favorsBadgeColor: 'landlord',
      explanation: 'Introducing a $100 deductible per repair regardless of fault shifts routine landlord maintenance obligations onto the tenant.'
    },
    {
      id: 'diff-4',
      section: 'Section 5: Assignment & Subletting',
      clauseTitle: 'Subletting Approval Standard',
      oldText: 'Tenant shall not assign or sublet any portion of the premises under any circumstances.',
      newText: 'Tenant may sublet with Landlord’s prior written consent, which shall not be unreasonably withheld or delayed.',
      favorsParty: 'Tenant',
      favorsBadgeColor: 'tenant',
      explanation: 'Changing from an absolute ban to allowing subletting with consent that "shall not be unreasonably withheld" favors the Tenant, granting mobility if they need to relocate.'
    }
  ]
};

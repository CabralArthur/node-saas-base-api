# Node SaaS Base API

## Description
This project is a base API for a Software as a Service (SaaS) application built with Node.js. It provides a starting point for developing scalable and maintainable SaaS applications.

## Database Diagram
Below is a simple database diagram for the application:



User Permissions Database Diagram:

[User Permissions Database Diagram](https://drawsql.app/teams/arthur-cabrals-team/diagrams/user-permissions)

## TODOs
- [x] **User Signup**: Implement the functionality for new users to create an account.
- [x] **Verify Email**: Add email verification to ensure the authenticity of user email addresses.
- [x] **User Login**: Develop the login mechanism for users to access their accounts.
- [ ] **Reset Password**: Create a feature that allows users to reset their passwords if they forget them.
- [ ] **Subscription Flow**: Design and implement the subscription flow, including plan selection, payment processing, and subscription management.
    - [ ] **System Integration**: Set the team fields:
          paymentProcessorUserId    String? @unique
          subscriptionPlan          String?
          subscriptionStatus        String  @default("trial") // 'trial', 'active', 'cancel_at_period_end', 'past_due', 'deleted'
          datePaid                  DateTime?
    - [ ] **Stripe Integration**: Integrate Stripe for handling payments, including setting up webhooks, managing customer subscriptions, and processing transactions.
- [ ] **API Documentation**: Write comprehensive documentation for the API endpoints, including request and response examples.

import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Error "mo:core/Error";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Nat8 "mo:core/Nat8";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Random "mo:core/Random";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import InviteLinksModule "invite-links/invite-links-module";
import UserApproval "user-approval/approval";

actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Approval System
  let approvalState = UserApproval.initState(accessControlState);

  // Invite Links System
  let inviteState = InviteLinksModule.initState();

  type Gender = { #male; #female; #nonBinary };

  // Likes tracking: user -> [users they liked]
  let userLikes = Map.empty<Principal, [Principal]>();
  
  // Matches between users (mutual likes)
  let matches = Map.empty<Principal, [Principal]>();
  let usersInterests = Map.empty<Principal, [Text]>();

  // Types for profiles
  public type UserProfile = {
    name : Text;
    age : Nat8;
    gender : Gender;
    bio : Text;
    photo : Storage.ExternalBlob;
    creativeField : Text;
    creativeFieldText : Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      switch (Text.compare(profile1.name, profile2.name)) {
        case (#equal) { Nat.compare(profile1.age.toNat(), profile2.age.toNat()) };
        case (order) { order };
      };
    };

    public func compareByCreativeField(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      Text.compare(profile1.creativeField, profile2.creativeField);
    };
  };

  // Store user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Messaging
  public type Message = {
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Int;
  };

  // Messages stored by conversation pair (sorted principals as key)
  let messages = Map.empty<Text, [Message]>();

  // Helper Functions
  func genderToText(gender : Gender) : Text {
    switch (gender) {
      case (#male) { "male" };
      case (#female) { "female" };
      case (#nonBinary) { "nonBinary" };
    };
  };

  func isMatched(user1 : Principal, user2 : Principal) : Bool {
    switch (matches.get(user1)) {
      case (null) { false };
      case (?matchList) {
        matchList.find<Principal>(func(p) { Principal.equal(p, user2) }) != null;
      };
    };
  };

  func getConversationKey(user1 : Principal, user2 : Principal) : Text {
    let p1 = user1.toText();
    let p2 = user2.toText();
    if (Text.compare(p1, p2) == #less) {
      p1 # ":" # p2;
    } else {
      p2 # ":" # p1;
    };
  };

  // Members Profiles Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin can view any");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(name : Text, age : Nat8, gender : Gender, bio : Text, photo : Storage.ExternalBlob, creativeFieldText : Text, interests : [Text]) : async () {
    // Must be approved user or admin
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: You must be approved to create or update your profile");
    };

    let userProfile : UserProfile = {
      name;
      age;
      gender;
      bio;
      photo;
      creativeField = "";
      creativeFieldText;
    };

    usersInterests.add(caller, interests);
    userProfiles.add(caller, userProfile);
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    // Only approved users can browse other members
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can browse members");
    };
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can browse members");
    };
    
    // Return only approved users' profiles (exclude pending and caller themselves)
    let allProfiles = userProfiles.entries().toArray();
    let approvedProfiles = allProfiles.filter(
      func((principal, profile)) {
        not Principal.equal(principal, caller) and 
        (UserApproval.isApproved(approvalState, principal) or AccessControl.isAdmin(accessControlState, principal));
      }
    );
    approvedProfiles.map<(Principal, UserProfile), UserProfile>(func((_, profile)) { profile }).sort();
  };

  public query ({ caller }) func getAllUsersByCreativeField() : async [UserProfile] {
    // Only approved users can browse other members
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can browse members");
    };
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can browse members");
    };
    
    // Return only approved users' profiles (exclude pending and caller themselves)
    let allProfiles = userProfiles.entries().toArray();
    let approvedProfiles = allProfiles.filter(
      func((principal, profile)) {
        not Principal.equal(principal, caller) and 
        (UserApproval.isApproved(approvalState, principal) or AccessControl.isAdmin(accessControlState, principal));
      }
    );
    approvedProfiles.map<(Principal, UserProfile), UserProfile>(func((_, profile)) { profile }).sort(UserProfile.compareByCreativeField);
  };

  // Like/Pass System
  public shared ({ caller }) func likeUser(targetUser : Principal) : async Bool {
    // Must be approved user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like profiles");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can like profiles");
    };

    // Cannot like yourself
    if (Principal.equal(caller, targetUser)) {
      Runtime.trap("Cannot like yourself");
    };

    // Target must be approved
    if (not (UserApproval.isApproved(approvalState, targetUser))) {
      Runtime.trap("Target user is not approved");
    };

    // Add like
    let currentLikes = switch (userLikes.get(caller)) {
      case (null) { [] };
      case (?likes) { likes };
    };

    // Check if already liked
    let alreadyLiked = currentLikes.find<Principal>(func(p) { Principal.equal(p, targetUser) }) != null;
    if (alreadyLiked) {
      return false; // Already liked, no match created
    };

    let newLikes = currentLikes.concat([targetUser]);
    userLikes.add(caller, newLikes);

    // Check if target also liked caller (mutual like = match)
    let targetLikes = switch (userLikes.get(targetUser)) {
      case (null) { [] };
      case (?likes) { likes };
    };

    let mutualLike = targetLikes.find<Principal>(func(p) { Principal.equal(p, caller) }) != null;
    
    if (mutualLike) {
      // Create match for both users
      let callerMatches = switch (matches.get(caller)) {
        case (null) { [] };
        case (?m) { m };
      };
      matches.add(caller, callerMatches.concat([targetUser]));

      let targetMatches = switch (matches.get(targetUser)) {
        case (null) { [] };
        case (?m) { m };
      };
      matches.add(targetUser, targetMatches.concat([caller]));

      return true; // Match created
    };

    return false; // Like recorded, no match yet
  };

  public query ({ caller }) func getMatches() : async [Principal] {
    // Must be approved user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can view matches");
    };

    switch (matches.get(caller)) {
      case (null) { [] };
      case (?matchList) { matchList };
    };
  };

  // Messaging Functions
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async () {
    // Must be approved user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can send messages");
    };

    // Receiver must be approved
    if (not (UserApproval.isApproved(approvalState, receiver))) {
      Runtime.trap("Receiver is not an approved user");
    };

    // Must be matched to send messages
    if (not isMatched(caller, receiver)) {
      Runtime.trap("Unauthorized: Can only message matched users");
    };

    let senderProfile = userProfiles.get(caller);
    let receiverProfile = userProfiles.get(receiver);

    switch ((senderProfile, receiverProfile)) {
      case (null, _) { throw Error.reject("Sender profile not found") };
      case (_, null) { throw Error.reject("Receiver profile not found") };
      case (?_, ?_) {
        let newMsg : Message = {
          sender = caller;
          receiver;
          content;
          timestamp = Time.now();
        };

        let conversationKey = getConversationKey(caller, receiver);
        let existingMsgs = switch (messages.get(conversationKey)) {
          case (null) { [] };
          case (?msgs) { msgs };
        };
        messages.add(conversationKey, existingMsgs.concat([newMsg]));
      };
    };
  };

  public query ({ caller }) func getMessages(otherUser : Principal) : async [Message] {
    // Must be approved user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    if (not (UserApproval.isApproved(approvalState, caller))) {
      Runtime.trap("Unauthorized: Only approved users can view messages");
    };

    // Must be matched to view messages
    if (not isMatched(caller, otherUser)) {
      Runtime.trap("Unauthorized: Can only view messages with matched users");
    };

    let conversationKey = getConversationKey(caller, otherUser);
    switch (messages.get(conversationKey)) {
      case (null) { [] };
      case (?msgs) { msgs };
    };
  };

  // Invite Link + RSVP system endpoints (needed for code compilation!)
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // Approval system endpoints (needed for code compilation!)
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};

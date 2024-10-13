---
title: git 조금 더 활용하기
author: 장호빈
pubDatetime: 2024-06-25T22:00:00
postSlug: learn-more-about-git
featured: false
draft: false
tags:
  - git

description: 'git을 조금 더 잘쓰고 싶어 정리해 본 짤막한 글 입니다.'
---

## 시작하며

일을 하며 항상 git을 사용하게 된다. 어느 순간부터 너무 자주 쓰는 명령어만 사용하고 있는 느낌을 받았고 git 커밋 내역을 더 잘 관리할 수 있는데 그러지 못하고 있다는 생각이 들었다. 그 동안 잘 안 쓰고 있던 git 명령어들을 더 알아보고 자유자재로 사용하기 위해 이 글을 남긴다.

## Rebase

rebase는 커밋 내역을 편집하는 데 핵심이 되는 기능이다. re-base는 기반을 다시 정한다는 의미인데, 이것을 두 가지 방향으로 해석할 수 있다.

### 이전 커밋 내역 정리

작업을 할 때 항상 처음 생각했던 대로 진행되는 것이 아니고 여러 번 삽질할 수도 있으며, 작업이 상당히 진행된 후에 잘못된 부분을 깨달을 수도 있다. 이런 상황들이 무서워서 커밋을 남기기를 두려워할 수는 없다. 작업하는 중에 커밋은 원하는만큼 잘게 나눠서 마음껏 할 수 있어야 한다. 그러기 위해서는 내가 만든 커밋 내역은 나중에 정리할 수 있다는 확신이 있어야 한다.

```console
git rebase -i [수정을 시작할 기반 커밋]
```

위의 명령어를 실행하면 수정할 커밋부터 현재 커밋까지의 수정할 수 있는 리스트가 표시되며 커밋 메시지 편집, 커밋 순서 변경, 작업 내용 변경 등 여러 수정을 할 수 있다.

```console
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup [-C | -c] <commit> = like "squash" but keep only the previous
#                    commit's log message, unless -C is used, in which case
#                    keep only this commit's message; -c is same as -C but
#                    opens the editor
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
# .       create a merge commit using the original merge commit's
# .       message (or the oneline, if no original merge commit was
# .       specified); use -c <commit> to reword the commit message
#
# These lines can be re-ordered; they are executed from top to bottom.
```

### 다른 브랜치에 이어 붙이기

```console
git rebase [기준_브렌치] [이어붙일_브렌치]
```

위의 명령어를 실행하면 [기준 브랜치]와 [이어붙일 브랜치]의 공통 조상 커밋을 기준으로하여 [이어붙일 브랜치]의 커밋 내역들이 뜯겨 [기준 브랜치]의 뒤에 새로운 커밋 내역으로 붙게 된다. 싹뚝 짤라서 이어 붙이는 느낌이다.

## Cherry-Pick

cherry-pick은 콕 찝어서 특정 커밋만 가져오는 것이다. 기존 브랜치에 작업은 해놨지만 기획의 변경으로 인해 새로운 브랜치에서 작업을 다시 해야 할 경우, 기존 브랜치에서 필요한 커밋만 뽑아와서 새 브랜치에 적용시킬 수 있디.

## Rebase와 Cherry-Pick

rebase와 cherry-pick을 적극적으로 활용하면 얻을 수 있는 것은 원격 브랜치에 올릴 잘 정리된 커밋 내역을 만들 수 있는 능력이다.

로컬에서는 아무리 복잡하게 여러 브랜치를 만들고 새로운 시도를 해보고 삽질을 해보고 커밋 내역을 막 남겨놔도 결국에는 잘 정리된 커밋 내역 한 줄로 만들어 원격 브랜치에 올릴 수 있다. 그래서 작업을 더 과감하게 할 수 있게된다.

## Revert

```console
git revert --no-commit [되돌릴 커밋...]
```

rebase와 cherry-pick 같은 커밋 수정 기능은 로컬에서만 사용해야한다. 이미 원격 저장소에 push한 후에는 다른 팀원이 해당 저장소를 pull 받아 사용하고 있을 수 있기 때문에 마음대로 커밋을 수정하면 안된다.

만약 원격 저장소에 올라간 커밋 중에 치명적인 오류가 있어 해당 커밋을 되돌려야 할 경우, revert 명령어를 사용하여 기존 커밋 내용을 유지하고 문제 있는 커밋을 되돌릴 수 있는 새로운 커밋을 생성할 수 있다.

## 마치며

Git 명령어를 알아보면서 커밋 내역을 스스로 관리하는 과정이 글쓰기와 닮아 있다고 느꼈다. 글을 쓸 때 처음부터 완벽하게 쓰이지 않고, 계속해서 수정하며 한 편의 완성된 글을 만들어가는 과정과 비슷하다.  
마찬가지로 개발을 할 때도 커밋 내역을 정리하고 관리하기 위해 rebase와 cherry-pick을 사용하여 작업을 조정하는 과정이 필요하고 거기에 능숙해질 필요가 있다고 느꼈다.
